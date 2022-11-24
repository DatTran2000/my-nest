import { AppService } from './app.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { Controller, Get, Req, Put, Post } from '@nestjs/common';
import { Request } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly firebaseAuthService : FirebaseAuthService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('login') 
  getLogin(@Req() req : Request): object {
    return this.firebaseAuthService.getLogin(req);
  }

  @Put('update-user') 
  updateUser(@Req() req : Request): any {
    return this.firebaseAuthService.updateUser(req);
  }

  @Post('create-ad')
  createAd(@Req() req : Request): any {
    return this.firebaseAuthService.createAd(req);
  }
}
