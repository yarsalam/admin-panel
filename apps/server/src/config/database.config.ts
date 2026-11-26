import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isProduction = process.env.NODE_ENV === 'production';
    const required = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
    const missing = required.filter((key) => !process.env[key]);
    if (isProduction && missing.length > 0) {
      throw new Error(`Missing required production database settings: ${missing.join(', ')}`);
    }
    return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'admin123',
    database: process.env.DB_NAME || 'admin_yarsalam',
    charset: 'utf8mb4',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
    autoLoadEntities: true,
    };
  },
);
