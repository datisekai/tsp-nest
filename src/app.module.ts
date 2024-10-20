import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule, RolesBuilder } from 'nest-access-control';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassModule } from './modules/class/class.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { GoogleAIModule } from './modules/googleai/googleai.module';
import { InitModule } from './modules/init/init.module';
import { LetterModule } from './modules/letter/letter.module';
import { MajorModule } from './modules/major/major.module';
import { MetaModule } from './modules/meta/meta.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PermissionModule } from './modules/permission/permission.module';
import { QuestionModule } from './modules/question/question.module';
import { RoleModule } from './modules/role/role.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { LanguageModule } from './modules/language/language.module';

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
    QuestionModule,
    GoogleAIModule,
    LanguageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
