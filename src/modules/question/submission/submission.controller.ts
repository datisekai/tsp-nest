import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import {
  RunTestCodeDto,
  SubmitCodeDto,
  SubmitMultipleChoiceDto,
  UpdateSubmissionDto,
} from './submission.dto';
import { Permissions, User } from 'src/common/decorators';

import { User as UserEntity } from '../../user/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';

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
    return await this.submissionService.getMySubmissionOfExam(examId, user.id);
  }

  @Get('/history/:examId/user/:userId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.EXAM_VIEW)
  @ApiPermissions(AppPermission.EXAM_VIEW)
  async getHistoryByUserId(
    @Param('examId') examId: number,
    @User() user: UserEntity,
  ) {
    return await this.submissionService.getMySubmissionOfExam(examId, user.id);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.EXAM_UPDATE)
  @ApiPermissions(AppPermission.EXAM_UPDATE)
  async update(@Param('id') id: number, @Body() dto: UpdateSubmissionDto) {
    return await this.submissionService.updateResult(id, dto);
  }
}
