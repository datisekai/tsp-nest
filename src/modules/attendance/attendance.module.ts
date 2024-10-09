import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from '../permission/permission.module';
import { UserModule } from '../user/user.module';
import { Attendance } from './attendance.entity';
import { AttendanceService } from './attendance.service';
import { Attendee } from './attendee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Attendee]),
    UserModule,
    PermissionModule,
  ],
  controllers: [],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
