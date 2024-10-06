import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from '../permission/permission.module';
import { FacultyModule } from '../faculty/faculty.module';
import { UserModule } from '../user/user.module';
import { Notification } from './notification.entity';
import { ClassModule } from '../class/class.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    UserModule,
    ClassModule,
    PermissionModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
