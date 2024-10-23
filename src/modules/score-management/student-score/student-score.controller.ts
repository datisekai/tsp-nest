import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppResource } from 'src/app.role';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { CreateMultipleStudentScoreDto } from './student-score.dto';
import { StudentScoreService } from './student-score.service';

@ApiTags(AppResource.STUDENT_CORE)
@Controller('api.student-score')
export class StudentScoreController {
  constructor(private studentScoreService: StudentScoreService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  create(@Body() createMultipleStudentScoreDto: CreateMultipleStudentScoreDto) {
    return this.studentScoreService.update(
      createMultipleStudentScoreDto.studentScore,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('class/:classId')
  async getStudentScoresWithColumnsByClassId(
    @Param('classId') classId: number,
  ) {
    return this.studentScoreService.getStudentScoresWithColumnsByClassId(
      classId,
    );
  }
}
