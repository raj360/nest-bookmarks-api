import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtGaurd } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.dectorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGaurd)
  @Get('/profile')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @UseGuards(JwtGaurd)
  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
