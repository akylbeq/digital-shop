import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;
  @IsNotEmpty()
  @IsString()
  duration: string;
  @IsString()
  payment_method: string;
}
