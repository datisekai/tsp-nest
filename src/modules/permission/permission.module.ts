import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Permission } from './permission.entity';
import { PermissionService } from './permission.service';
import { Role } from '../role/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, User, Role])],
  controllers: [],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
