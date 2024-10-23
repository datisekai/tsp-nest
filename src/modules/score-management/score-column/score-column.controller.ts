import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppResource } from 'src/app.role';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { CreateMultipleScoreColumnsDto } from './score-column.dto';
import { ScoreColumnService } from './score-column.service';

@ApiTags(AppResource.SCORE_COLUMN)
@Controller('api.score-column')
export class ScoreColumnController {
  constructor(private scoreColumnService: ScoreColumnService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':majorId')
  findByMajorId(@Param('majorId') majorId: number) {
    return this.scoreColumnService.findByMajorId(majorId);
  }

  @Post('')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  update(@Body() updateScoreColumnDto: CreateMultipleScoreColumnsDto) {
    return this.scoreColumnService.update(updateScoreColumnDto);
  }
}
