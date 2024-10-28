import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from '../permission/permission.module';
import { FacultyModule } from '../faculty/faculty.module';
import { UserModule } from '../user/user.module';
import { Exam } from './exam.entity';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { QuestionModule } from '../question/question.module';
import { ClassModule } from '../class/class.module';
import {ExamQuestion} from "./exam-question/exam-question.entity";
import {ExamLog} from "./exam-log/exam-log.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, ExamQuestion, ExamLog]),
    ClassModule,
    PermissionModule,
    forwardRef(() => QuestionModule),
  ],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
