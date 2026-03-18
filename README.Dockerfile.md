# Dockerfile (API Model Node)

Este README descreve o processo definido no `Dockerfile` do projeto `API.Model.Node`.

## Estrutura do Dockerfile

O `Dockerfile` usa `multi-stage build` (construção em múltiplas etapas) para gerar uma imagem final leve e segura:

1. **Stage builder** (`node:24-slim`)
   - `WORKDIR /app`
   - copia `package.json`, `package-lock.json` e `tsconfig*.json`
   - copia a pasta `src`
   - `npm install`
   - `npm run build` (compila TypeScript para `dist`)
   - `npm prune --production` (remove dependências de desenvolvimento)

2. **Stage runtime** (`node:24-slim`)
   - `WORKDIR /app`
   - `ENV NODE_ENV=production`
   - copia `dist`, `node_modules` e `package.json` do stage builder
   - `EXPOSE 8000`
   - `CMD ["node", "dist/main.js"]`

## Explicação de cada parâmetro do Dockerfile

- `FROM node:24-slim AS builder`:
  - define imagem base Node.js 24 (slim) e nomeia este estágio como `builder`.
- `WORKDIR /app`:
  - muda o diretório de trabalho para `/app` (equivalente a `cd /app`).
- `COPY package.json package-lock.json* ./`:
  - copia arquivos de dependências para a imagem. `package-lock.json*` pega lockfile mais variações.
- `COPY tsconfig*.json ./`:
  - copia configuração TypeScript para o container.
- `COPY src ./src`:
  - copia código-fonte para o container.
- `RUN npm install`:
  - instala dependências declaradas em package.json.
- `RUN npm run build`:
  - executa script de build (normalmente `tsc`) para gerar `dist`.
- `RUN npm prune --production`:
  - remove dependências de desenvolvimento, mantendo apenas produção.
- `FROM node:24-slim AS runtime`:
  - nova imagem para execução, com o mesmo runtime base.
- `ENV NODE_ENV=production`:
  - define ambiente para produção dentro do container.
- `COPY --from=builder /app/dist ./dist`:
  - copia artefatos de build do estágio `builder`.
- `COPY --from=builder /app/node_modules ./node_modules`:
  - copia dependências de produção do estágio `builder`.
- `COPY --from=builder /app/package.json ./package.json`:
  - copia metadata do projeto (útil para health checks ou info).
- `EXPOSE 8000`:
  - declara porta de escuta da aplicação (documentação sem publicar automaticamente).
- `CMD ["node", "dist/main.js"]`:
  - comando padrão ao iniciar o container.

## Como construir a imagem Docker

```bash
# no diretório raiz do projeto
docker build -t franciscosant/api-model-node:v1 .
```

## Como executar localmente

```bash
docker run --rm -p 8000:8000 franciscosant/api-model-node:v1
```

A aplicação ficará disponível em `http://localhost:8000`.

## Para Kubernetes (AKS)

No seu `deployment.yaml`, o Service está configurado como `LoadBalancer`:

- porta `8000` -> `targetPort: 8000`
- use `kubectl get svc api-node-service` para achar o `EXTERNAL-IP`
- acesse `http://<external-ip>:8000`

Opcional:
- `kubectl port-forward svc/api-node-service 8000:8000` para acessar `http://localhost:8000`

## Melhorias sugeridas

- adicionar `HEALTHCHECK` no Dockerfile.
- usar `ENV PORT=8000` + `CMD ["node", "dist/main.js"]` / `entrypoint` com fallback.
- ativar `docker build --platform linux/amd64` se precisar em runner que não é linux.

## Notas

- `EXPOSE` é informativo. Para exposição real, configure `-p` local ou `Service`/Ingress no Kubernetes.
- Não copie `node_modules` da máquina local; o Docker faz a instalação dentro do build.
