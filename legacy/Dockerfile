FROM node:22-bookworm-slim

WORKDIR /app

RUN useradd -m user

COPY . .

RUN npm install

USER user

EXPOSE 3000

CMD ["node", "src/server.js"]
