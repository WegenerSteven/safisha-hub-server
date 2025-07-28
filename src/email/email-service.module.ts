import { Module } from '@nestjs/common';
import { EmailService } from './email-service.service';
// import { EmailServiceController } from './email-service.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          pool: false,
          host: configService.getOrThrow<string>('MAIL_HOST'),
          port: parseInt(configService.getOrThrow<string>('MAIL_PORT'), 10),
          secure: false,
          auth: {
            user: configService.getOrThrow<string>('MAIL_USER'),
            pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
          },
          logger: true,
          debug: true, // Enable for debugging purposes
        },
        defaults: {
          from: `"${configService.getOrThrow('MAIL_FROM_NAME')}" <${configService.getOrThrow('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  // controllers: [EmailServiceController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailServiceModule {}
