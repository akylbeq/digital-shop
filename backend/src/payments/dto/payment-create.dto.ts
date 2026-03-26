import { IsNotEmpty, IsNumber } from 'class-validator';

export class PaymentCreateDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
