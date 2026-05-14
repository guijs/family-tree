import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }

  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  getRedisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  getRedisPassword(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }
}
