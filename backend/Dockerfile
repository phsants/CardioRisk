# Backend - Node.js API
FROM node:20-alpine

WORKDIR /app

# Build context no EasyPanel é a raiz do repo (Caminho de Build: /)
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte do backend
COPY backend/ .

# Expor porta
EXPOSE 3001

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3001

# Comando para iniciar
CMD ["node", "server.js"]
