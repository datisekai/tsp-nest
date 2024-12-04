import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from '../permission/permission.module';
import { FacultyModule } from '../faculty/faculty.module';
import { UserModule } from '../user/user.module';
import { Letter } from './letter.entity';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { ClassModule } from '../class/class.module';

@Module({
  imports: [TypeOrmModule.forFeature([Letter]), PermissionModule],
  controllers: [LetterController],
  providers: [LetterService],
  exports: [LetterService],
})
export class LetterModule {}
