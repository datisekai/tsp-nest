import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule, RolesBuilder } from 'nest-access-control';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { InitModule } from './modules/init/init.module';
import { MajorModule } from './modules/major/major.module';
import { ClassModule } from './modules/class/class.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MetaModule } from './modules/meta/meta.module';
import { LetterModule } from './modules/letter/letter.module';
import { AttendanceModule } from './modules/attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    AccessControlModule.forRoles(new RolesBuilder()),
    AuthModule,
    UserModule,
    UploadModule,
    PermissionModule,
    RoleModule,
    FacultyModule,
    InitModule,
    MajorModule,
    ClassModule,
    NotificationModule,
    MetaModule,
    LetterModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
