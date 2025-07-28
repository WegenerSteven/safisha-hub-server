import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Body,
  UploadedFiles,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { CloudinaryExceptionFilter } from './cloudinary-exception.filter';
import { FileValidationPipe } from './file-validation.pipe';

@ApiTags('File Upload')
@Controller('file-upload')
@UseFilters(new CloudinaryExceptionFilter())
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('business-image')
  @ApiOperation({ summary: 'Upload a business service image' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Business service image file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBusinessImage(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const { url, publicId } =
        await this.fileUploadService.saveServiceImage(file);
      return {
        success: true,
        url,
        publicId,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Internal server error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload a user avatar' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    const { url, publicId } = await this.fileUploadService.saveAvatar(file);
    return {
      success: true,
      url,
      publicId,
    };
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 files
  async uploadMultipleFiles(
    @UploadedFiles(FileValidationPipe) files: Express.Multer.File[],
  ) {
    const uploads = await Promise.all(
      files.map((file) =>
        this.fileUploadService.uploadFile(file, { folder: 'general' }),
      ),
    );

    return {
      success: true,
      files: uploads,
    };
  }
}
