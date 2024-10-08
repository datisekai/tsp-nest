import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty.entity';
import { PermissionModule } from '../permission/permission.module';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faculty]), PermissionModule],
  controllers: [FacultyController],
  providers: [FacultyService],
  exports: [FacultyService],
})
export class FacultyModule {}
