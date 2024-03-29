import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { EditUserDto } from '../src/user/dto/edit-user.dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);
    pactum.request.setBaseUrl('http://localhost:3333');
    prisma = app.get(PrismaService);
    await prisma.cleanDB();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@example.com',
      password: 'test',
    };

    describe('Sign up', () => {
      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: 'test',
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'test@example.com',
          })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
    });

    describe('Sign in', () => {
      it('should  throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'test@example.com',
          })
          .expectStatus(400);
      });

      it('should  throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: 'test',
          })
          .expectStatus(400);
      });

      it('should  throw if body is empty', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('token', 'access_token');
      });
    });
  });

  describe('User', () => {
    const dto: EditUserDto = {
      email: 'raymondkalumba@gmail.com',
      firstName: 'Raymond',
      lastName: 'Kalumba',
    };

    describe('profile', () => {
      it('should get user', () => {
        return pactum
          .spec()
          .get('/users/profile')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectBodyContains('[]');
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        link: 'https://www.google.com',
        title: 'Google',
        description: 'Thank you for visiting google',
      };

      it('should create bookmarks', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.link)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Bookmark by id', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'Google',
        description: 'Thank you for visiting google',
      };

      it('should edit bookmarks', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmarks', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
