import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  QueryNotificationDto,
} from './notification.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Request } from 'express';
import { User as UserEntity } from '../user/user.entity';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions, User } from 'src/common/decorators';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { AppPermission, AppResource } from 'src/app.role';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(AppResource.NOTIFICATION)
@Controller('api.notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Tạo một thông báo mới
  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.NOTIFICATION_CREATE)
  @ApiPermissions(AppPermission.NOTIFICATION_CREATE)
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @User() user: UserEntity,
  ) {
    return this.notificationService.create(createNotificationDto, user.id);
  }

  // Lấy tất cả thông báo với phân trang và tìm kiếm theo name, classId
  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.NOTIFICATION_VIEW)
  @ApiPermissions(AppPermission.NOTIFICATION_VIEW)
  async findAll(@Query() queryNotificationDto: QueryNotificationDto) {
    return this.notificationService.findAll(queryNotificationDto);
  }

  // Lấy thông báo theo owner (người tạo) với phân trang
  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.NOTIFICATION_VIEW_OWN)
  @ApiPermissions(AppPermission.NOTIFICATION_VIEW_OWN)
  async findAllByOwner(
    @Query() queryNotificationDto: QueryNotificationDto,
    @User() user: UserEntity,
  ) {
    return this.notificationService.findAllByOwner(
      user.id,
      queryNotificationDto,
    );
  }

  // Lấy một thông báo theo ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(
    AppPermission.NOTIFICATION_VIEW,
    AppPermission.NOTIFICATION_VIEW_OWN,
  )
  @ApiPermissions(
    AppPermission.NOTIFICATION_VIEW,
    AppPermission.NOTIFICATION_VIEW_OWN,
  )
  async findOne(@Param('id') id: number) {
    return this.notificationService.findOne(id);
  }

  // Cập nhật một thông báo theo ID
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.NOTIFICATION_UPDATE)
  @ApiPermissions(AppPermission.NOTIFICATION_UPDATE)
  async update(
    @Param('id') id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  // Xóa một thông báo theo ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.NOTIFICATION_DELETE)
  @ApiPermissions(AppPermission.NOTIFICATION_DELETE)
  async delete(@Param('id') id: number) {
    return this.notificationService.delete(id);
  }

  // API để lấy thông báo của người dùng hiện tại với phân trang
  @Get('public/me')
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(
    @User() user: UserEntity,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.notificationService.findNotificationsByUser(
      user.id,
      paginationDto,
    );
  }
}
