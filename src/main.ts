import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not in DTO
      forbidNonWhitelisted: true, // throws an error if non-whitelisted properties are found
      transform: true, // automatically transforms payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // allows implicit conversion of types
      },
    }),
  );

  //api versioning
  app.setGlobalPrefix('api/v1');

  //global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService = app.get(ConfigService);
  const PORT: number = parseInt(configService.getOrThrow<string>('PORT'), 10);

  //swagger setup
  const config = new DocumentBuilder()
    .setTitle('Safisha Hub API')
    .setDescription('API documentation for Safisha Hub')
    .setVersion('1.0')
    .addTag('users')
    .addTag('service-providers')
    .addTag('bookings')
    .addTag('payments')
    .addTag('reviews')
    .addTag('notifications')
    .addBearerAuth()
    .setExternalDoc('Find more info here', 'https://example.com')
    .addServer(`http://localhost:3000/`, 'Development Server')
    .addServer(`https://api.safishahub.com`, 'Production Server')
    .addServer(`https://staging.safishahub.com`, 'Staging Server')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: '/api-json',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      docsExpansion: 'none',
      filter: true,
    },
    customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .scheme-container { display: none; }
    .swagger-ui .info { margin-bottom: 20px; }`,
    customSiteTitle: 'Safisha Hub API Documentation',
  });

  //listen on port 3000
  await app.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
    console.log('Database connected successfully');
  });
}
bootstrap();
