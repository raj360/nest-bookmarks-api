import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGaurd } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.dectorator';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  @UseGuards(JwtGaurd)
  @Get('/profile')
  getProfile(@GetUser() user: User) {
    return user;
  }
}
