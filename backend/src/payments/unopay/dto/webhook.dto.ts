import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class WebhookMetadata {
  @IsNumber()
  orderId: number;
}

export class UnopayWebhookBody {
  @IsString()
  event: string;

  @IsString()
  transaction_id: string;

  @IsString()
  status: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  payment_method: string;

  @IsString()
  description: string;

  @IsString()
  created_at: string;

  @IsString()
  @IsOptional()
  payer_email: string;

  @IsBoolean()
  @IsOptional()
  is_test: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => WebhookMetadata)
  metadata: WebhookMetadata;
}
