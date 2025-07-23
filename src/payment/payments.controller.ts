import { Body, Controller, Post } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import type {
  PaystackChargeResponse,
  PaystackVerifyResponse,
} from './payment.interface';
import {
  CreateMpesaPaymentDto,
  CreateCardPaymentDto,
} from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('mpesa')
  @ApiOperation({ summary: 'Initiate Mpesa payment' })
  @ApiResponse({ status: 200, description: 'Payment initiated', type: Object })
  async initiateMpesa(
    @Body() createPaymentDto: CreateMpesaPaymentDto,
  ): Promise<PaystackChargeResponse> {
    return this.paystackService.initiateMpesaPayment(
      createPaymentDto.amount,
      createPaymentDto.phone,
      createPaymentDto.email,
    );
  }

  @Post('card')
  @ApiOperation({ summary: 'Process card payment' })
  @ApiResponse({
    status: 200,
    description: 'Card payment processed',
    type: Object,
  })
  async processCard(
    @Body() createCardDto: CreateCardPaymentDto,
  ): Promise<PaystackChargeResponse> {
    return this.paystackService.initiateCardPayment(
      createCardDto.amount,
      createCardDto.email,
      {
        number: createCardDto.number,
        cvv: createCardDto.cvv,
        expiry_month: createCardDto.expiry_month,
        expiry_year: createCardDto.expiry_year,
        pin: createCardDto.pin,
      },
    );
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment' })
  @ApiResponse({ status: 200, description: 'Payment verified', type: Object })
  async verifyPayment(
    @Body() verifyDto: VerifyPaymentDto,
  ): Promise<PaystackVerifyResponse> {
    return this.paystackService.verifyPayment(verifyDto.reference);
  }
}
