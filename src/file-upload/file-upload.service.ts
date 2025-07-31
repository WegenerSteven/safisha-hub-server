import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
      secure: true,
    });
  }

  /**
   * Generic file upload method
   */
  async uploadFile(
    file: Express.Multer.File,
    options: {
      folder: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      transformation?: Record<string, any>;
    },
  ): Promise<{ url: string; publicId: string }> {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: options.folder,
            resource_type: options.resourceType || 'auto',
            transformation: options.transformation,
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              this.logger.error(
                `Cloudinary upload error: ${error.message}`,
                error.stack,
              );
              reject(new Error(error?.message || 'Cloudinary upload error'));
            } else if (!result) {
              reject(new Error('Cloudinary upload returned no result'));
            } else {
              resolve(result);
            }
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`File upload failed: ${errorMessage}`, errorStack);
      throw new Error(`File upload failed: ${errorMessage}`);
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`File deletion failed: ${errorMessage}`, errorStack);
      throw new Error(`File deletion failed: ${errorMessage}`);
    }
  }

  /**
   * Specialized methods for specific use cases
   */
  async saveAvatar(file: Express.Multer.File) {
    return this.uploadFile(file, {
      folder: 'avatars',
      transformation: { width: 200, height: 200, crop: 'fill' },
    });
  }

  async saveServiceImage(file: Express.Multer.File) {
    return this.uploadFile(file, {
      folder: 'services',
      transformation: { width: 800, height: 600, crop: 'limit' },
    });
  }
}
