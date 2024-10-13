import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassService } from './class.service';
import {
  CreateClassDto,
  UpdateClassDto,
  AssignTeachersDto,
  AssignUsersDto,
  ImportUsersDto,
  QueryClassDto,
} from './class.dto';
import { Class } from './class.entity';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions, User } from 'src/common/decorators';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { User as UserEntity } from '../user/user.entity';

@ApiTags(AppResource.CLASS)
@Controller('api.class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.CLASS_CREATE)
  @ApiPermissions(AppPermission.CLASS_CREATE)
  @Post()
  async createClass(@Body() createClassDto: CreateClassDto): Promise<Class> {
    return this.classService.create(createClassDto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.CLASS_VIEW)
  @ApiPermissions(AppPermission.CLASS_VIEW)
  @Get()
  async findAll(
    @Query() queryClassDto: QueryClassDto,
    @User() user: UserEntity,
  ): Promise<{ data: Class[]; total: number }> {
    return this.classService.findAll(queryClassDto, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.CLASS_VIEW)
  @ApiPermissions(AppPermission.CLASS_VIEW)
  async findOne(@Param('id') classId: number): Promise<Class> {
    return this.classService.findOne(classId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.CLASS_UPDATE)
  @ApiPermissions(AppPermission.CLASS_UPDATE)
  async updateClass(
    @Param('id') classId: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<Class> {
    return this.classService.update(classId, updateClassDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.CLASS_DELETE)
  @ApiPermissions(AppPermission.CLASS_DELETE)
  async deleteClass(@Param('id') classId: number): Promise<Class> {
    return await this.classService.delete(classId);
  }

  @Patch(':id/assign-teachers')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.CLASS_UPDATE)
  @ApiPermissions(AppPermission.CLASS_UPDATE)
  async assignTeachersToClass(
    @Param('id') classId: number,
    @Body() assignTeachersDto: AssignTeachersDto,
  ): Promise<Class> {
    return this.classService.assignTeachersToClass(classId, assignTeachersDto);
  }

  @Patch(':id/assign-users')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.CLASS_UPDATE_STUDENT)
  @ApiPermissions(AppPermission.CLASS_UPDATE_STUDENT)
  async assignUsersToClass(
    @Param('id') classId: number,
    @Body() assignUsersDto: AssignUsersDto,
  ): Promise<Class> {
    return this.classService.assignUsersToClass(classId, assignUsersDto);
  }

  @Post(':id/import-users')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.CLASS_UPDATE_STUDENT)
  @ApiPermissions(AppPermission.CLASS_UPDATE_STUDENT)
  async importUsers(
    @Param('id') classId: number,
    @Body() importUsersDto: ImportUsersDto,
  ): Promise<Class> {
    return this.classService.importUsers(classId, importUsersDto);
  }

  @Post(':id/import-teachers')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiPermissions(AppPermission.CLASS_UPDATE)
  @Permissions(AppPermission.CLASS_UPDATE)
  async importTeachers(
    @Param('id') classId: number,
    @Body() importTeachersDto: ImportUsersDto,
  ): Promise<Class> {
    return this.classService.importTeachers(classId, importTeachersDto);
  }
}
