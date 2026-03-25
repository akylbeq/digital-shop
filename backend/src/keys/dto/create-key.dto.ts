import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateKeyDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
