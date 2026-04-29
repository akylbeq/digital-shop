import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UploadImageController } from './upload-image/upload-image.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3/s3.service';
import { PaymentsModule } from './payments/payments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { Key } from './keys/key.entity';
import { Order } from './orders/order.entity';
import { ReferralTransaction } from './referrals/referral-transaction.entity';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { KeysModule } from './keys/keys.module';
import { OrdersModule } from './orders/orders.module';
import { TelegramModule } from './telegram/telegram.module';

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
        entities: [User, Category, Product, Key, Order, ReferralTransaction],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    KeysModule,
    OrdersModule,
    TelegramModule,
    PaymentsModule,
  ],
  controllers: [AuthController, UploadImageController],
  providers: [AuthService, S3Service],
})
export class AppModule {}
