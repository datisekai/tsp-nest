import { BadRequestException, Injectable } from '@nestjs/common';
import path from "node:path";

@Injectable()
export class UploadService {
    handleFileUpload(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('no file uploaded');
        }


        // validate file size (e.g., max 5mb)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('file is too large!');
        }

        return { message: 'File uploaded successfully', filePath: 'uploads/' + file.filename };
    }
}