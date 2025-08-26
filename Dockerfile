FROM node:20.16-alpine3.19

WORKDIR /app

COPY package*.json .

RUN npm ci --omit=dev && npm cache clean --force

RUN npm build

COPY . .

EXPOSE 7826

CMD ['npm', 'run', 'server']