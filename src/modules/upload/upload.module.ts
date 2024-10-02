import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [PermissionModule],
  controllers: [UploadController],
  providers: [],
  exports: [],
})
export class UploadModule {}
