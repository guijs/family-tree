import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database.config';
import { JwtConfig } from './jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  providers: [DatabaseConfig, JwtConfig],
  exports: [ConfigModule, DatabaseConfig, JwtConfig],
})
export class AppConfigModule {}
