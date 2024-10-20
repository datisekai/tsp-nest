import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from '../permission/permission.module';
import { UserModule } from '../user/user.module';
import { ChapterController } from './chapter/chapter.controller';
import { Chapter } from './chapter/chapter.entity';
import { ChapterService } from './chapter/chapter.service';
import { DifficultyController } from './difficulty/difficulty.controller';
import { Difficulty } from './difficulty/difficulty.entity';
import { DifficultyService } from './difficulty/difficulty.service';
import { QuestionController } from './question.controller';
import { Question } from './question.entity';
import { QuestionService } from './question.service';
import { SubmissionController } from './submission/submission.controller';
import { Submission } from './submission/submission.entity';
import { SubmissionService } from './submission/submission.service';
import { TestCase } from './testcase/testcase.entity';
import { Judge0Service } from '../judge0/judge0.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      TestCase,
      Chapter,
      Difficulty,
      Submission,
    ]),
    UserModule,
    PermissionModule,
  ],
  controllers: [
    QuestionController,
    ChapterController,
    DifficultyController,
    SubmissionController,
  ],
  providers: [
    QuestionService,
    ChapterService,
    DifficultyService,
    SubmissionService,
    Judge0Service,
  ],
  exports: [
    QuestionService,
    ChapterService,
    DifficultyService,
    SubmissionService,
    Judge0Service,
  ],
})
export class QuestionModule {}
