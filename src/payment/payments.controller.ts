import { Body, Controller, Post } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorators';

@ApiTags('payments')
@Public()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize payment' })
  @ApiResponse({ status: 200, description: 'Payment initialized' })
  async initializePayment(@Body() body: { amount: number; email: string }) {
    console.log(
      `Initializing payment with amount: ${body.amount}, email: ${body.email}`,
    );
    return this.paystackService.initializePayment(body.amount, body.email);
  }

  @Post('mpesa/complete')
  @ApiOperation({ summary: 'Complete Mpesa payment' })
  @ApiResponse({ status: 200, description: 'Mpesa payment completed' })
  async completeMpesaPayment(
    @Body()
    body: {
      amount: number;
      phone: string;
      email: string;
      reference: string;
    },
  ) {
    return this.paystackService.completeMpesaPayment(
      body.amount,
      body.phone,
      body.email,
      body.reference,
    );
  }

  @Post('card/complete')
  @ApiOperation({ summary: 'Complete card payment' })
  @ApiResponse({ status: 200, description: 'Card payment completed' })
  async completeCardPayment(
    @Body()
    body: {
      amount: number;
      email: string;
      card: {
        number: string;
        cvv: string;
        expiry_month: string;
        expiry_year: string;
        pin?: string;
      };
      reference: string;
    },
  ) {
    return this.paystackService.completeCardPayment(
      body.amount,
      body.email,
      body.card,
      body.reference,
    );
  }

  @Post('otp')
  @ApiOperation({ summary: 'Submit OTP for payment' })
  @ApiResponse({ status: 200, description: 'OTP submitted' })
  async submitOtp(@Body() body: { reference: string; otp: string }) {
    return this.paystackService.submitOtp(body.reference, body.otp);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  async verifyPayment(@Body() body: { reference: string }) {
    return this.paystackService.verifyPayment(body.reference);
  }
}
