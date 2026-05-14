import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtConfig {
  constructor(private configService: ConfigService) {}

  getSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'default-secret');
  }

  getExpiration(): string {
    return this.configService.get<string>('JWT_EXPIRATION', '7d');
  }
}
