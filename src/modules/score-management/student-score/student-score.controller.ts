import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { CreateMultipleStudentScoreDto } from './student-score.dto';
import { StudentScoreService } from './student-score.service';
import { Permissions } from '../../../common/decorators';
import { ApiPermissions } from '../../../common/decorators/api.decorator';

@ApiTags(AppResource.STUDENT_CORE)
@Controller('api.student-score')
export class StudentScoreController {
  constructor(private studentScoreService: StudentScoreService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.STUDENT_SCORE_UPDATE)
  @ApiPermissions(AppPermission.SCORE_COLUMN_UPDATE)
  create(@Body() createMultipleStudentScoreDto: CreateMultipleStudentScoreDto) {
    return this.studentScoreService.update(
      createMultipleStudentScoreDto.studentScore,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('class/:classId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.STUDENT_SCORE_VIEW)
  async getStudentScoresWithColumnsByClassId(
    @Param('classId') classId: number,
  ) {
    return this.studentScoreService.getStudentScoresWithColumnsByClassId(
      classId,
    );
  }
}
