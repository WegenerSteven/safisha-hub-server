import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  PaystackInitializeResponse,
  PaystackChargeResponse,
  PaystackVerifyResponse,
  PaystackCard,
} from './payment.interface';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly api: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.api = axios.create({
      baseURL: this.configService.get<string>('PAYSTACK_BASE_URL'),
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize a payment (for redirect flow)
   */
  async initializePayment(
    amount: number,
    email: string,
    metadata?: Record<string, any>,
  ): Promise<PaystackInitializeResponse> {
    try {
      const payload = {
        amount: amount * 100, // Convert to kobo/cent
        email,
        currency: 'KES',
        callback_url: this.configService.get<string>('CALLBACK_URL'),
        metadata,
      };

      this.logger.log(`Initializing payment: ${JSON.stringify(payload)}`);

      const response = await this.api.post<PaystackInitializeResponse>(
        '/transaction/initialize',
        payload,
      );
      const data = response.data;
      console.log(`Payment initialized: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.handleApiError(error, 'Payment initialization failed');
    }
  }

  /**
   * Complete Mpesa payment (STK Push)
   */
  async completeMpesaPayment(
    amount: number,
    phone: string,
    email: string,
    reference: string,
  ): Promise<PaystackChargeResponse> {
    try {
      const formattedPhone = this.formatPhone(phone);
      const payload = {
        amount: amount * 100,
        email,
        currency: 'KES',
        reference, // Reference from initialization
        mobile_money: {
          phone: formattedPhone,
          provider: 'mpesa',
        },
      };

      this.logger.log(`Completing Mpesa payment: ${JSON.stringify(payload)}`);

      const response = await this.api.post<PaystackChargeResponse>(
        '/charge',
        payload,
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Mpesa payment failed');
    }
  }

  /**
   * Complete card payment
   */
  async completeCardPayment(
    amount: number,
    email: string,
    card: PaystackCard,
    reference: string,
  ): Promise<PaystackChargeResponse> {
    try {
      const payload = {
        amount: amount * 100,
        email,
        currency: 'KES',
        reference, // Reference from initialization
        card: {
          number: card.number,
          cvv: card.cvv,
          expiry_month: card.expiry_month,
          expiry_year: card.expiry_year,
        },
        pin: card.pin,
      };

      this.logger.log(`Completing card payment: ${JSON.stringify(payload)}`);

      const response = await this.api.post<PaystackChargeResponse>(
        '/charge',
        payload,
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Card payment failed');
    }
  }

  /**
   * Submit OTP for payment validation
   */
  async submitOtp(
    reference: string,
    otp: string,
  ): Promise<PaystackChargeResponse> {
    try {
      const payload = { reference, otp };

      const response = await this.api.post<PaystackChargeResponse>(
        '/charge/submit_otp',
        payload,
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error, 'OTP submission failed');
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await this.api.get<PaystackVerifyResponse>(
        `/transaction/verify/${reference}`,
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Payment verification failed');
    }
  }

  /**
   * Common error handler
   */
  private handleApiError(error: unknown, defaultMessage: string): never {
    let errorMessage = defaultMessage;

    if (error instanceof AxiosError) {
      errorMessage += `: ${error.message}`;
      if (error.response) {
        this.logger.error('API error response', error.response.data);
        const data: unknown = error.response.data;
        const detailMessage =
          data && typeof data === 'object' && 'message' in data
            ? (data as { message?: string }).message
            : undefined;
        errorMessage += ` - ${detailMessage || 'No additional details'}`;
      }
    } else if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }

    this.logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Format phone number for Mpesa
   */
  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return cleaned;
    }
    if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    throw new Error('Invalid Kenyan phone number format');
  }
}
