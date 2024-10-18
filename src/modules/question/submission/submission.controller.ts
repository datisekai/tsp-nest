import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmitCodeDto, SubmitMultipleChoiceDto } from './submission.dto';
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
      submitMultipleChoiceDto.questionId,
      submitMultipleChoiceDto.answer,
    );
  }

  @Post('submit-code')
  @UseGuards(JwtAuthGuard)
  async submitCode(
    @Body() submitCodeDto: SubmitCodeDto,
    @User() user: UserEntity,
  ) {
    return this.submissionService.submitCode(
      user.id,
      submitCodeDto.questionId,
      submitCodeDto.language,
      submitCodeDto.code,
    );
  }
}
