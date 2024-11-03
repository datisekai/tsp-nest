import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import {
  CreateMultipleScoreColumnsDto,
  CreateScoreColumnMajorDto,
} from './score-column.dto';
import { ScoreColumnService } from './score-column.service';
import { ApiPermissions } from '../../../common/decorators/api.decorator';
import { Permissions } from '../../../common/decorators';

@ApiTags(AppResource.SCORE_COLUMN)
@Controller('api.score-column')
export class ScoreColumnController {
  constructor(private scoreColumnService: ScoreColumnService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':majorId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.SCORE_COLUMN_VIEW)
  findByMajorId(@Param('majorId') majorId: number) {
    return this.scoreColumnService.findByMajorId(majorId);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get('/class/:classId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.SCORE_COLUMN_VIEW)
  findByClassId(@Param('classId') classId: number) {
    return this.scoreColumnService.findByClassId(classId);
  }

  @Post('')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.SCORE_COLUMN_UPDATE)
  update(@Body() updateScoreColumnDto: CreateMultipleScoreColumnsDto) {
    return this.scoreColumnService.update(updateScoreColumnDto);
  }

  @Post('/multiple')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.SCORE_COLUMN_UPDATE)
  updateMultiple(@Body() dto: CreateScoreColumnMajorDto) {
    return this.scoreColumnService.updateMultiple(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiPermissions()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.SCORE_COLUMN_DELETE)
  deleteScoreColumn(@Param('id') id: number) {
    return this.scoreColumnService.deleteScoreColumn(id);
  }
}
