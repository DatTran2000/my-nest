import { AppService } from './app.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly firebaseAuthService : FirebaseAuthService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('login') 
  getLogin(@Req() req : Request): any {
    return this.firebaseAuthService.getLogin(req);
  }
}
