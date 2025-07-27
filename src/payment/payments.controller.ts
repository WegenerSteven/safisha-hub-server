import { Body, Controller, Post } from '@nestjs/common';
import { Get, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaystackService } from './paystack.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorators';
import { AtGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetCurrentUserId } from 'src/auth/decorators/get-current-user.decorator';
import { PaymentStatus } from './entities/payment.entity';

@ApiTags('payments')
@Public()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly paymentsService: PaymentsService,
  ) {}
  @UseGuards(AtGuard, RolesGuard)
  @Get('my')
  @ApiOperation({ summary: 'Get payments for current user' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  async getMyPayments(@GetCurrentUserId() userId: string) {
    return this.paymentsService.findByUserId(userId);
  }

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
  @UseGuards(AtGuard, RolesGuard)
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  async verifyPayment(
    @Body() body: { reference: string; bookingId?: string; amount: number },
    @GetCurrentUserId() userId: string,
  ) {
    const result = await this.paystackService.verifyPayment(body.reference);
    if (
      typeof result === 'object' &&
      result !== null &&
      'status' in result &&
      result.status === true
    ) {
      if (!body.bookingId) {
        throw new Error('Missing bookingId in payment verification request');
      }
      await this.paymentsService.create({
        reference: body.reference,
        booking_id: body.bookingId,
        amount: body.amount,
        user_id: userId,
        status: PaymentStatus.SUCCEEDED as PaymentStatus,
        created_at: new Date(),
      });
    }
    return result;
  }
}
