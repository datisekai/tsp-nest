import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassModule } from '../class/class.module';
import { UserModule } from '../user/user.module';
import { ScoreColumn } from './score-column/score-column.entity';
import { StudentScore } from './student-score/student-score.entity';
import { ScoreColumnController } from './score-column/score-column.controller';
import { StudentScoreController } from './student-score/student-score.controller';
import { PermissionModule } from '../permission/permission.module';
import { ScoreColumnService } from './score-column/score-column.service';
import { StudentScoreService } from './student-score/student-score.service';
import { MajorModule } from '../major/major.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScoreColumn, StudentScore]),
    ClassModule,
    UserModule,
    PermissionModule,
    MajorModule,
  ],
  controllers: [ScoreColumnController, StudentScoreController],
  providers: [ScoreColumnService, StudentScoreService],
})
export class ScoreManagementModule {}
