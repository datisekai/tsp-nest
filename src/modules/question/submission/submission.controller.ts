import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import {
  RunTestCodeDto,
  SubmitCodeDto,
  SubmitMultipleChoiceDto,
} from './submission.dto';
import { User } from 'src/common/decorators';

import { User as UserEntity } from '../../user/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { AppResource } from 'src/app.role';
import { JwtAuthGuard } from 'src/modules/auth/guards';

@ApiTags(AppResource.SUBMISSION)
@Controller('api.submission')
export class SubmissionController {
  constructor(private submissionService: SubmissionService) {}

  @Post('submit-multiple-choice')
  @UseGuards(JwtAuthGuard)
  async submitMultipleChoice(
    @Body() submitMultipleChoiceDto: SubmitMultipleChoiceDto,
    @User() user: UserEntity,
  ) {
    return this.submissionService.submitMultipleChoice(
      user.id,
      submitMultipleChoiceDto.examQuestionId,
      submitMultipleChoiceDto.answer,
      submitMultipleChoiceDto.examId,
    );
  }

  @Get('/score/:examId')
  @UseGuards(JwtAuthGuard)
  async getStudentGradesByExam(@Param('examId') examId: number) {
    const data = await this.submissionService.getStudentGradesByExam(examId);
    return { data };
  }

  @Post('submit-code')
  @UseGuards(JwtAuthGuard)
  async submitCode(
    @Body() submitCodeDto: SubmitCodeDto,
    @User() user: UserEntity,
  ) {
    return this.submissionService.submitCode(submitCodeDto, user);
  }

  @Post('run-test-code')
  @UseGuards(JwtAuthGuard)
  async runTestCode(@Body() dto: RunTestCodeDto, @User() user: UserEntity) {
    return this.submissionService.runTestCode(dto);
  }


  @Get('/history/:examId')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Param('examId') examId: number, @User() user: UserEntity) {
    return await this.submissionService.getMySubmissionOfExam(examId, user);
  }
}
