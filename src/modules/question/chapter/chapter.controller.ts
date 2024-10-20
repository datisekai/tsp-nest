import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { ChapterService } from './chapter.service';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { Permissions, User } from 'src/common/decorators';
import { CreateChapterDto, QueryChapterDto } from '../question.dto';
import { User as UserEntity } from '../../user/user.entity';

@ApiTags(AppResource.CHAPTER)
@Controller('api.chapter')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.QUESTION_CREATE)
  @ApiPermissions(AppPermission.QUESTION_CREATE)
  async createChapter(
    @Body() createChapterDto: CreateChapterDto,
    @User() user: UserEntity,
  ) {
    return this.chapterService.createChapter(createChapterDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.QUESTION_DELETE)
  @ApiPermissions(AppPermission.QUESTION_DELETE)
  async deleteChapter(@Param('id') id: number, @User() user: UserEntity) {
    return this.chapterService.deleteChapter(id, user);
  }

  @Get()
  async getAllChapters(@Query() dto: QueryChapterDto) {
    return this.chapterService.getAll(dto);
  }
}
