# /backend-nodejs/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Instala dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN apk add --no-cache netcat-openbsd
RUN npm install

# Instala 'nodemon' globalmente no container para hot-reload
RUN npm install -g nodemon


COPY . .

EXPOSE 5000

# Inicia em modo de desenvolvimento
CMD ["nodemon", "src/index.js"]
