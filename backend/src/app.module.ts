import { Module } from '@nestjs/common';
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
import { KeysService } from './keys/keys.service';
import { KeysController } from './keys/keys.controller';
import { Key } from './keys/key.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3/s3.service';
import { PaymentsModule } from './payments/payments.module';
import { Order } from './orders/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Category, Product, Key, Order],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    TypeOrmModule.forFeature([User, Category, Product, Key, Order]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '2h',
        },
      }),
    }),
    PaymentsModule,
  ],
  controllers: [
    UsersController,
    AuthController,
    CategoriesController,
    ProductsController,
    UploadImageController,
    KeysController,
  ],
  providers: [
    UsersService,
    AuthService,
    TokenService,
    CategoriesService,
    ProductsService,
    KeysService,
    S3Service,
  ],
})
export class AppModule {}
