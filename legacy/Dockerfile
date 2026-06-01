FROM node:22-bookworm-slim

WORKDIR /app

RUN useradd -m user

COPY package.json ./

RUN npm install

COPY . .

USER user

EXPOSE 3000

CMD ["node", "src/server.js"]
