import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.getOrThrow<string>('FRONTEND_URL') ||
      'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '🎉 Welcome to Safarihub - Verify Your Email',
      template: 'email-verification', //this will look for email-template
      context: {
        firstName,
        verificationUrl,
        companyName: 'SafishaHub',
        supportEmail: 'support@safishahub.com',
      },
    });
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string,
    role: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: '🚗 Welcome to SafishaHub - Your Account is Ready!',
      template: 'welcome',
      context: {
        firstName,
        role: role === 'service_provider' ? 'Service Provider' : 'Customer',
        loginUrl: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/login`,
        dashboardUrl: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/dashboard`,
        companyName: 'SafishaHub',
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '🔐 SafishaHub - Reset Your Password',
      template: 'password-reset',
      context: {
        firstName,
        resetUrl,
        companyName: 'SafishaHub',
        supportEmail: 'support@safishahub.com',
      },
    });
  }
}
