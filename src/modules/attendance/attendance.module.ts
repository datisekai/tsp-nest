import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from '../permission/permission.module';
import { UserModule } from '../user/user.module';
import { Attendance } from './attendance.entity';
import { AttendanceService } from './attendance.service';
import { Attendee } from './attendee.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceGateway } from './attendance.gateway';
import {ClassModule} from "../class/class.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Attendee]),
    UserModule,
    PermissionModule,
      ClassModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceGateway],
  exports: [AttendanceService, AttendanceGateway],
})
export class AttendanceModule {}
