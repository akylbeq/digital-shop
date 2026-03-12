import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './auth/token.service';
import { CategoriesService } from './categories/categories.service';
import { Category } from './categories/category.entity';
import { CategoriesController } from './categories/categories.controller';
import { ProductsService } from './products/products.service';
import { Product } from './products/product.entity';
import { ProductsController } from './products/products.controller';
import { UploadImageController } from './upload-image/upload-image.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'mydb',
      entities: [User, Category, Product],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Category, Product]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AppController, UsersController, AuthController, CategoriesController, ProductsController, UploadImageController],
  providers: [AppService, UsersService, AuthService, TokenService, CategoriesService, ProductsService],
})
export class AppModule {}
