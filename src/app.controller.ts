import { AppService } from './app.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { Controller, Get, Req, Put, Post, Body } from '@nestjs/common';
import { Request } from '@nestjs/common';
import { UpdateUserProfileDto } from './dto/UpdateUserProfileDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { CreateAdDto } from './dto/CreateAdDto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly firebaseAuthService : FirebaseAuthService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('login') 
  getLogin(@Body() loginUserDto : LoginUserDto): object {
    return this.firebaseAuthService.getLogin(loginUserDto);
  }

  @Put('update-user') 
  updateUser(@Body() updateUserProfileDto: UpdateUserProfileDto): object {
    return this.firebaseAuthService.updateUser(updateUserProfileDto);
  }

  @Post('create-ad')
  createAd(@Body() createAdDto : CreateAdDto): object {
    return this.firebaseAuthService.createAd(createAdDto);
  }
}
