import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserApiClientService } from './user-api-client.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [UserApiClientService],
  exports: [UserApiClientService],
})
export class UserApiClientModule {}
