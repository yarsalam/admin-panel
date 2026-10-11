FROM node:22

WORKDIR /app

RUN npm install -g pnpm@9

COPY . .

RUN pnpm install

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "run", "dev"]