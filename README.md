# Usuarios API Node

Exemplo do mesmo CRUD implementado em Node.js com Fastify, TypeScript, Swagger, persistencia em memoria, testes automatizados e arquitetura Ports and Adapters.

## Tecnologias

- Node.js 24
- TypeScript 5
- Fastify 5
- Zod 4
- Swagger UI
- Vitest 4

## Pre-requisitos

- Windows com PowerShell
- Node.js 24+
- npm 11+

Para validar a instalacao:

```powershell
node --version
npm --version
```

## Arquitetura

Estrutura do projeto:

```text
src/
|-- adapters
|   |-- inbound/http
|   `-- outbound/repositories
|-- application
|   `-- services
|-- domain
|   `-- ports
`-- main.ts

tests/
|-- integration/http
`-- unit/application
```

Responsabilidades:

- `domain`: entidade, erros e contrato do repositorio
- `application`: comando de entrada e servico de negocio
- `adapters/outbound`: persistencia em memoria
- `adapters/inbound/http`: schemas Zod e rotas HTTP
- `main.ts`: bootstrap do servidor

## Modelo de dominio

- `id: int`
- `nome: string`
- `dtNascimento: date`
- `status: bool`
- `telefones: string[]`

## Como rodar

Na pasta `node`:

### 1. Instalar dependencias

```powershell
npm install
```

### 2. Rodar em modo desenvolvimento

```powershell
npm run dev
```

### 3. Acessar a aplicacao

- API: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`

### 4. Build e execucao compilada

```powershell
npm run build
npm start
```

## Como testar

```powershell
npm test
```

Resultado esperado no estado atual do projeto:

- testes unitarios do servico
- testes de integracao HTTP
- 9 testes passando

## Como validar tipos

```powershell
npm run check-types
```

## Endpoints

- `GET /health/live`
- `GET /health/ready`
- `POST /usuarios`
- `GET /usuarios`
- `GET /usuarios/{usuarioId}`
- `PUT /usuarios/{usuarioId}`
- `DELETE /usuarios/{usuarioId}`

## Exemplo de payload

```json
{
	"id": 1,
	"nome": "Carlos",
	"dtNascimento": "1992-03-14",
	"status": true,
	"telefones": [
		"11911112222",
		"1122223333"
	]
}
```

## CI

O workflow fica em `.github/workflows/ci.yml` e executa:

- instalacao com `npm ci`
- checagem de tipos
- build
- testes

## Observacoes

- A persistencia e totalmente em memoria.
- Ao reiniciar a aplicacao, os dados sao perdidos.
- A API usa validacao via Zod e gera Swagger a partir dos schemas.

## Comandos uteis

```powershell
npm install
npm run dev
npm run check-types
npm run build
npm test
```
