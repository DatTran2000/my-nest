import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAuthService } from './firebase-auth.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ConfigService, FirebaseAuthService],
})
export class AppModule {}
