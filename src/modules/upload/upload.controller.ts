import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from '../../app.role';
import { uploadFromBuffer } from '../../common/helpers/upload';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../../common/decorators';
import {UploadService} from "./upload.service";

@ApiTags(AppResource.UPLOAD)
@Controller('api.upload')
export class UploadController {
  constructor(   private readonly uploadService: UploadService) {

  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.handleFileUpload(file);
  }

  // @Post('/image')
  // @ApiOperation({
  //   summary: 'Upload Image',
  // })
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // // @Permissions(AppPermission.UPLOAD_IMAGE)
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile() file) {
  //   try {
  //     const result: any = await uploadFromBuffer(file, 'image');
  //     return { url: result.secure_url };
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error('Failed to upload and process file');
  //   }
  // }

  @Post('/video')
  @ApiOperation({
    summary: 'Upload Video',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.UPLOAD_VIDEO)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: any) {
    try {
      const result: any = await uploadFromBuffer(file, 'video');
      return { url: result.secure_url };
    } catch (error) {
      console.log(error);
      throw new Error('Failed to upload and process file');
    }
  }
}
