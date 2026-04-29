import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;
  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  @IsIn(['sbp', 'card', 'admin'])
  payment_method: string;
}
