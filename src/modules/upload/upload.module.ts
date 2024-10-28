import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { PermissionModule } from '../permission/permission.module';
import {MulterModule} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {UploadService} from "./upload.service";
import * as path from "node:path";

@Module({
  imports: [PermissionModule, MulterModule.register({
    storage: diskStorage({
      destination: path.join(__dirname, '..', '..', '..', 'public', 'uploads'),
      filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
      },
    }),
  }),],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
