export interface PallyCreateBillResponse {
  success: boolean | string;
  link_url: string;
  link_page_url: string;
  bill_id: string;
}

export interface PallyPaymentStatusResponse {
  success?: boolean | string;
  status: 'NEW' | 'PROCESS' | 'UNDERPAID' | 'SUCCESS' | 'OVERPAID' | 'FAIL';
  bill_id: string;
}

export class PallyWebhookBody {
  Status: 'SUCCESS' | 'FAIL' | (string & {});
  InvId: string;
  Commission?: string;
  CurrencyIn?: 'RUB' | 'USD' | 'EUR' | (string & {});
  OutSum: string;
  TrsId?: string;
  custom?: string;
  SignatureValue: string;
}
