import { Module } from '@nestjs/common';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggerMiddleware } from './logger.middleware';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payment/payments.module';
import { LocationsModule } from './location/locations.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notification/notifications.module';
import { EmailServiceModule } from './email/email-service.module';
import { SmsModule } from './sms/sms.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { BusinessesModule } from './businesses/businesses.module';
import { AtGuard } from './auth/guards/at.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    UsersModule,
    ServicesModule,
    BookingsModule,
    PaymentsModule,
    LocationsModule,
    ReviewsModule,
    NotificationsModule,
    EmailServiceModule,
    SmsModule,
    AuthModule,
    AnalyticsModule,
    FileUploadModule,
    BusinessesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
