import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    // Configure Multer for memory storage (files will be in memory before processing)
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
