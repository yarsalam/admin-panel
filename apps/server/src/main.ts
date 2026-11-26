import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { resolveCorsOrigins } from './config/cors-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 4000);
  console.log('APP STARTED');
}
bootstrap();
