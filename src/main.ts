import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const PORT: number = parseInt(configService.getOrThrow<string>('PORT'), 10);

  //listen on port 3000
  await app.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
    console.log('Database connected successfully');
  });
}
bootstrap();
