import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import slugify from 'slugify';

@Injectable()
export class UploadService {
  handleImageUpload(
    file: Express.Multer.File,
    width?: number,
    height?: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException('File is too large! Maximum size is 2MB.');
    }

    let image = sharp(file.buffer); // Tạo đối tượng sharp từ file.buffer

    // Nếu có `width` và `height`, thực hiện resize ảnh
    if (width && height) {
      // Kiểm tra giá trị `width` và `height` hợp lệ (lớn hơn 0)
      if (width <= 0 || height <= 0) {
        throw new BadRequestException(
          'Width and height must be greater than 0',
        );
      }

      // Resize ảnh nếu có `width` và `height`
      image = image.resize(+width, +height);
    }

    // Tiến hành tối ưu hóa ảnh (ví dụ: giảm chất lượng JPEG)
    return image
      .webp({ quality: 80 }) // Optimize the file size with 80% quality
      .toBuffer() // Get the processed image as a Buffer
      .then((data) => {
        const filename = `${Date.now()}.webp`;
        // Lưu ảnh đã xử lý vào thư mục public/uploads
        const optimizedFilePath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'public',
          'uploads',
          filename,
        );

        // Lưu file đã được tối ưu hóa
        fs.writeFileSync(optimizedFilePath, data);

        return {
          message: 'File uploaded and processed successfully',
          filePath: 'uploads/' + filename,
        };
      })
      .catch((error) => {
        throw new BadRequestException(
          'Error processing image: ' + error.message,
        );
      });
  }

  handleAudioUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Kiểm tra loại file
    if (!file.mimetype.startsWith('audio/')) {
      throw new BadRequestException(
        'Invalid file type! Only audio files are allowed.',
      );
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    const maxAudioSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxAudioSize) {
      throw new BadRequestException('File is too large! Maximum size is 5MB.');
    }

    // Lưu trữ file audio
    try {
      const filename = `${Date.now()}_${slugify(file.originalname, {
        lower: true,
      })}`;
      const audioFilePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'uploads',
        filename,
      );

      fs.writeFileSync(audioFilePath, file.buffer);

      return {
        message: 'Audio uploaded successfully',
        filePath: 'uploads/' + filename,
      };
    } catch (error) {
      throw new BadRequestException(
        'Error processing audio file: ' + error.message,
      );
    }
  }
}
