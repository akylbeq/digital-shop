import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Key } from './key.entity';
import { KeysService } from './keys.service';
import { KeysController } from './keys.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Key]), AuthModule],
  controllers: [KeysController],
  providers: [KeysService],
  exports: [KeysService],
})
export class KeysModule {}
