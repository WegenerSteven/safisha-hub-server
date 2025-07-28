import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
