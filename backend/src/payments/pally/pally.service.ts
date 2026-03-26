import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PallyCreateBillResponse, PallyPaymentStatusResponse } from './types';

@Injectable()
export class PallyService {
  private readonly apiUrl = 'https://pal24.pro/api/v1';
  private readonly token: string;
  private readonly shopId: string;
  private readonly shopUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.getOrThrow<string>('PALLY_API_TOKEN');
    this.shopId = this.configService.getOrThrow<string>('PALLY_SHOP_ID');
    this.shopUrl = this.configService.getOrThrow<string>('PALLY_SHOP_URL');
  }

  private async parseJson<T>(response: Response): Promise<T> {
    const data: unknown = await response.json();
    return data as T;
  }

  async createBill(
    amount: number,
    orderId: string,
  ): Promise<PallyCreateBillResponse> {
    const response = await fetch(`${this.apiUrl}/bill/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        amount,
        order_id: orderId,
        shop_id: this.shopId,
        shop_url: this.shopUrl,
        currency_in: 'RUB',
        type: 'normal',
        custom: orderId,
      }),
    });

    if (!response.ok) {
      throw new BadGatewayException(await response.text());
    }

    return this.parseJson<PallyCreateBillResponse>(response);
  }

  async getPaymentStatus(billId: string): Promise<PallyPaymentStatusResponse> {
    const url = new URL(`${this.apiUrl}/payment/status`);
    url.searchParams.set('bill_id', billId);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new BadGatewayException(await response.text());
    }

    return this.parseJson<PallyPaymentStatusResponse>(response);
  }
}
