import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'development'
        ? [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'https://safisha-hub-server.onrender.com/api/docs',
            'https://safisha-hub-server.onrender.com',
          ]
        : true,
    methods: ['GET', 'POST', 'PUT', 'UPDATE', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Origin',
      'access-control-allow-origin',
    ],
    credentials: true, // Allow cookies to be sent with requests
    optionsSuccessStatus: 200, // Set status code for preflight requests
  });

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
  app.setGlobalPrefix('api');

  //global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService = app.get(ConfigService);
  const PORT: number = parseInt(configService.getOrThrow<string>('PORT'), 10);

  //swagger setup
  const config = new DocumentBuilder()
    .setTitle('Safisha Hub API')
    .setDescription(
      'API documentation for Safisha Hub car wash management system',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('customers', 'Customer management endpoints')
    .addTag('service-providers', 'Service provider management endpoints')
    .addTag('services', 'Service management endpoints')
    .addTag('bookings', 'Booking management endpoints')
    .addTag('payments', 'Payment processing endpoints')
    .addTag('reviews', 'Review management endpoints')
    .addBearerAuth()
    .addServer(`http://localhost:${PORT}/`, 'Development Server')
    .addServer(
      `https://safisha-hub-server.onrender.com/api/docs`,
      'Production Server',
    )
    .addServer(
      process.env.NODE_ENV === 'development'
        ? 'https://safisha-hub-server.onrender.com'
        : `http://localhost:${PORT}/`,
      process.env.NODE_ENV === 'development'
        ? 'Production Server'
        : 'Development Server',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Safisha Hub API Documentation',
    customfavIcon: '/logo.svg',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin-bottom: 20px; }
      .swagger-ui .scheme-container { background: #f7f7f7; }
    `,
  });

  //listen on port 3000
  await app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(
      `Swagger documentation available at http://localhost:${PORT}/api/docs`,
    );
    console.log('Database connected successfully');
  });
}

void bootstrap();
