import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
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

  // Initialize Mpesa Payment

  async initiateMpesaPayment(
    amount: number,
    phone: string,
    email: string,
  ): Promise<PaystackChargeResponse> {
    const payload = {
      amount: amount * 100, // Convert to kobo/cent
      email,
      currency: 'KES',
      mobile_money: {
        phone,
        provider: 'mpesa',
      },
      callback_url: this.configService.get<string>('CALLBACK_URL'),
    };

    try {
      const response = await this.api.post<PaystackChargeResponse>(
        '/charge',
        payload,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Paystack Mpesa error', errorMessage);
      if (
        error &&
        typeof error === 'object' &&
        (error as AxiosError).response
      ) {
        this.logger.error(
          'Paystack error response',
          JSON.stringify((error as AxiosError).response?.data),
        );
      }
      throw new Error('Payment initialization failed');
    }
  }

  // Initialize Card Payment

  async initiateCardPayment(
    amount: number,
    email: string,
    card: PaystackCard,
  ): Promise<PaystackChargeResponse> {
    const payload = {
      amount: amount * 100,
      email,
      currency: 'KES',
      card: {
        number: card.number,
        cvv: card.cvv,
        expiry_month: card.expiry_month,
        expiry_year: card.expiry_year,
      },
      pin: card.pin, // Required for some countries
    };

    try {
      const response = await this.api.post<PaystackChargeResponse>(
        '/charge',
        payload,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Paystack Card error', errorMessage);
      if (
        error &&
        typeof error === 'object' &&
        (error as AxiosError).response
      ) {
        this.logger.error(
          'Paystack error response',
          JSON.stringify((error as AxiosError).response?.data),
        );
      }
      throw new Error('Card payment failed');
    }
  }

  // Verify Payment
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await this.api.get<PaystackVerifyResponse>(
        `/transaction/verify/${reference}`,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Payment verification failed', errorMessage);
      if (
        error &&
        typeof error === 'object' &&
        (error as AxiosError).response
      ) {
        this.logger.error(
          'Paystack error response',
          JSON.stringify((error as AxiosError).response?.data),
        );
      }
      throw new Error('Payment verification failed');
    }
  }
}
