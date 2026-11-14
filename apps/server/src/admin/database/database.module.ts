import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from 'src/config/database.config';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
        const dbSync = config.get<string>('DB_SYNC') === 'true';

        if (nodeEnv === 'production' && dbSync) {
          throw new Error(
            'DB_SYNC=true is forbidden in production. Apply a reviewed database migration instead.',
          );
        }

        return {
          type: 'mysql' as const,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.database'),
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          // Auto schema synchronization is permitted only outside production
          // and only when explicitly requested with DB_SYNC=true.
          synchronize: nodeEnv !== 'production' && dbSync,
          logging: nodeEnv !== 'production',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
