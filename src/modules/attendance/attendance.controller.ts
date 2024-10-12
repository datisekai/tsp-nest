import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { Permissions, User } from 'src/common/decorators';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { User as UserEntity } from '../user/user.entity';
import {
  CreateAttendanceDto,
  QueryAttendanceDto,
  QueryAttendeeDto,
  UpdateAttendanceDto,
} from './attendance.dto';
import { Attendance } from './attendance.entity';
import { AttendanceService } from './attendance.service';
import { Attendee } from './attendee.entity';

@ApiTags(AppResource.ATTENDANCE)
@Controller('api.attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Tạo mới một Attendance
  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ATTENDANCE_CREATE)
  @ApiPermissions(AppPermission.ATTENDANCE_CREATE)
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @User() user: UserEntity,
  ): Promise<Attendance> {
    return await this.attendanceService.create(createAttendanceDto, user.id);
  }

  @Get('public/me')
  @UseGuards(JwtAuthGuard)
  async findAttendeeMe(
    @Query() queryAttendeeDto: QueryAttendeeDto,
    @User() user: UserEntity,
  ): Promise<{ data: Attendee[]; total: number }> {
    return await this.attendanceService.findAttendeeMe(
      queryAttendeeDto,
      user.id,
    );
  }

  // Lấy danh sách Attendance (có phân trang và lọc)
  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ATTENDANCE_VIEW)
  @ApiPermissions(AppPermission.ATTENDANCE_VIEW)
  async findAll(
    @Query() queryAttendanceDto: QueryAttendanceDto,
    @User() user: UserEntity,
  ): Promise<{ data: Attendance[]; total: number }> {
    return await this.attendanceService.findAll(queryAttendanceDto, user);
  }

  // Lấy thông tin Attendance theo ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ATTENDANCE_VIEW)
  @ApiPermissions(AppPermission.ATTENDANCE_VIEW)
  async findOne(@Param('id') id: number): Promise<Attendance> {
    const attendance = await this.attendanceService.findOne(id);
    if (!attendance) {
      throw new NotFoundException(`Attendance với ID ${id} không tồn tại`);
    }
    return attendance;
  }

  // Cập nhật thông tin Attendance theo ID
  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ATTENDANCE_UPDATE)
  @ApiPermissions(AppPermission.ATTENDANCE_UPDATE)
  async update(
    @Param('id') id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    return await this.attendanceService.update(id, updateAttendanceDto);
  }

  // Xóa Attendance theo ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ATTENDANCE_DELETE)
  @ApiPermissions(AppPermission.ATTENDANCE_DELETE)
  async remove(@Param('id') id: number): Promise<void> {
    return await this.attendanceService.remove(id);
  }
}
