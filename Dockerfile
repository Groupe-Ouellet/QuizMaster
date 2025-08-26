FROM node:20.16-alpine3.19

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

RUN npm run build

EXPOSE 7826