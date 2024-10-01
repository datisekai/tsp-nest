import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppResource } from 'src/app.role';
import { uploadFromBuffer } from 'src/common/helpers/upload';

@ApiTags(AppResource.UPLOAD)
@Controller('api.upload')
export class UploadController {
  constructor() {}

  @Post('/image')
  @ApiOperation({
    summary: 'Upload Image',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    try {
      const result: any = await uploadFromBuffer(file, 'image');
      return { url: result.secure_url };
    } catch (error) {
      console.log(error);
      throw new Error('Failed to upload and process file');
    }
  }

  @Post('/video')
  @ApiOperation({
    summary: 'Upload Video',
  })
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
