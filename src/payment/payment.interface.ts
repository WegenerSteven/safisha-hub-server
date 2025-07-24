export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackChargeResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    status: 'success' | 'failed' | 'pending';
    gateway_response: string;
    // ... other fields
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    amount: number;
    status: 'success' | 'failed';
    // ... other fields
  };
}

export interface PaystackCard {
  number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  pin?: string;
}
