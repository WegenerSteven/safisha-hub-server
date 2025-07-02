import { Module } from '@nestjs/common';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { ServiceProviderModule } from './service-provider/service-provider.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payment/payments.module';
import { LocationsModule } from './location/locations.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notification/notifications.module';
import { EmailServiceModule } from './email/email-service.module';
import { SmsModule } from './sms/sms.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    DatabaseModule,
    UsersModule,
    ServicesModule,
    ServiceProviderModule,
    BookingsModule,
    PaymentsModule,
    LocationsModule,
    ReviewsModule,
    NotificationsModule,
    EmailServiceModule,
    SmsModule,
    AuthModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
