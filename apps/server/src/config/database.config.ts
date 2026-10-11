import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5530', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'admin123',
    database: process.env.DB_NAME || 'admin_yarsalam',
    charset: 'utf8mb4',
    synchronize: process.env.DB_SYNC === 'true',
    autoLoadEntities: true,
  }),
);
