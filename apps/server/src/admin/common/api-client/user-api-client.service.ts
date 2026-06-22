import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface RequestOptions {
  auth?: boolean;
}

@Injectable()
export class UserApiClientService {
  private readonly logger = new Logger(UserApiClientService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('USER_API_BASE_URL');
    this.apiKey = this.configService.getOrThrow<string>('USER_API_KEY');
  }

  private buildHeaders(
    options: RequestOptions = { auth: true },
  ): Record<string, string> {
    const headers: Record<string, string> = {};
    if (options.auth !== false) {
      headers['x-api-key'] = this.apiKey;
    }
    return headers;
  }

  async get<T = any>(
    path: string,
    params?: Record<string, any>,
    options: RequestOptions = { auth: true },
  ): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<T>(`${this.baseUrl}${path}`, {
          params,
          headers: this.buildHeaders(options),
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(`GET ${path} failed: ${error.message}`);
      throw error;
    }
  }

  async post<T = any>(
    path: string,
    body?: any,
    options: RequestOptions = { auth: true },
  ): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<T>(`${this.baseUrl}${path}`, body, {
          headers: this.buildHeaders(options),
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(`POST ${path} failed: ${error.message}`);
      throw error;
    }
  }

  async patch<T = any>(
    path: string,
    body?: any,
    options: RequestOptions = { auth: true },
  ): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch<T>(`${this.baseUrl}${path}`, body, {
          headers: this.buildHeaders(options),
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(`PATCH ${path} failed: ${error.message}`);
      throw error;
    }
  }

  async delete<T = any>(
    path: string,
    options: RequestOptions = { auth: true },
  ): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete<T>(`${this.baseUrl}${path}`, {
          headers: this.buildHeaders(options),
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(`DELETE ${path} failed: ${error.message}`);
      throw error;
    }
  }
}
