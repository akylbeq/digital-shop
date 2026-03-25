import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { KeyStatus } from '../key.entity';

export class UpdateKeyDto {
  @IsNotEmpty()
  @IsString()
  key: string;
  @IsNotEmpty()
  @IsString()
  status: KeyStatus;
  @IsNotEmpty()
  @IsNumber()
  productId: KeyStatus;
}
