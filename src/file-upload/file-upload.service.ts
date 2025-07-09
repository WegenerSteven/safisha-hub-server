import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

@Injectable()
export class FileUploadService {
  // Base upload directory
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  // Avatar upload directory
  private readonly avatarsDir = path.join(this.uploadDir, 'avatars');

  constructor() {
    // Ensure directories exist
    void this.ensureDirectoriesExist();
  }

  /**
   * Ensure upload directories exist
   */
  private async ensureDirectoriesExist(): Promise<void> {
    if (!(await existsAsync(this.uploadDir))) {
      await mkdirAsync(this.uploadDir, { recursive: true });
    }

    if (!(await existsAsync(this.avatarsDir))) {
      await mkdirAsync(this.avatarsDir, { recursive: true });
    }
  }

  /**
   * Save avatar file and return the filename
   */
  saveAvatar(file: Express.Multer.File): string {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname) || '.jpg';
    const filename = `${uuidv4()}${fileExt}`;

    // Create write stream to save file
    const filePath = path.join(this.avatarsDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    // Return the filename that can be stored in the database
    return filename;
  }

  /**
   * Get the full path to an avatar file
   */
  getAvatarPath(filename: string): string {
    return path.join(this.avatarsDir, filename);
  }

  /**
   * Delete an avatar file
   */
  async deleteAvatar(filename: string): Promise<void> {
    const filePath = this.getAvatarPath(filename);
    if (await existsAsync(filePath)) {
      await promisify(fs.unlink)(filePath);
    }
  }
}
