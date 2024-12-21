import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from '../permission/permission.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Location } from './location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), PermissionModule],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
