FROM node:22

WORKDIR /app

RUN npm install -g pnpm@9

COPY . .

RUN pnpm install

WORKDIR /app/apps/server

EXPOSE 4000

CMD ["pnpm", "run", "start:dev"]