// --- Paystack Response Data Types ---
export interface PaystackChargeData {
  reference: string;
  status: string;
  display_text?: string;
  [key: string]: unknown;
}

export interface PaystackChargeResponse {
  status: boolean;
  message: string;
  data?: PaystackChargeData;
}

export interface PaystackVerifyData {
  id: number;
  status: string;
  reference: string;
  amount: number;
  channel: string;
  currency: string;
  [key: string]: unknown;
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: PaystackVerifyData;
}

export interface PaystackCard {
  number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  pin?: string;
}
