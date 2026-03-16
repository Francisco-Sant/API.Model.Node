FROM node:24-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY tsconfig*.json ./
COPY src ./src
RUN npm install
RUN npm run build
RUN npm prune --production

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 8000
CMD ["node", "dist/main.js"]