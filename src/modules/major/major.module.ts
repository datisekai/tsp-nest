import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from '../permission/permission.module';
import { Major } from './major.entity';
import { MajorController } from './major.controller';
import { MajorService } from './major.service';
import { FacultyModule } from '../faculty/faculty.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Major]),
    FacultyModule,
    forwardRef(() => UserModule),
    PermissionModule,
  ],
  controllers: [MajorController],
  providers: [MajorService],
  exports: [MajorService],
})
export class MajorModule {}
