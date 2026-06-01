FROM node:22-bookworm-slim

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "src/server.js"]
