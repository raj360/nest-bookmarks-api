import { Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  signup() {
    return {
      message: 'Iam havev signed in',
    };
  }

  signin() {
    return { message: 'Iam have signed in' };
  }
}
