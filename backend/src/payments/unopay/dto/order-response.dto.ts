import { IsNumber, IsString } from 'class-validator';

export class OrderResponseDto {
  @IsString()
  status: string;

  @IsString()
  transaction_id: string;

  @IsString()
  payment_url: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}
