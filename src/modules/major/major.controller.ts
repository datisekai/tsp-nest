import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MajorService } from './major.service';
import {
  CreateMajorDto,
  QueryMajorDto,
  UpdateMajorDto,
  AssignTeachersDto,
  CreateMultipleMajorDto,
} from './major.dto';
import { Major } from './major.entity';
import { AppPermission, AppResource } from '../..//app.role';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions, User } from 'src/common/decorators';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { User as UserEntity } from '../user/user.entity';

@ApiTags(AppResource.MAJOR)
@Controller('api.major')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.MAJOR_CREATE)
  @ApiPermissions(AppPermission.MAJOR_CREATE)
  @Post()
  async create(@Body() createMajorDto: CreateMajorDto): Promise<Major> {
    return this.majorService.create(createMajorDto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.MAJOR_CREATE)
  @ApiPermissions(AppPermission.MAJOR_CREATE)
  @Post('multiple')
  async createMultiple(@Body() dto: CreateMultipleMajorDto) {
    return this.majorService.createMultiple(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(AppPermission.MAJOR_VIEW)
  // @ApiPermissions(AppPermission.MAJOR_VIEW)
  async findAll(
    @Query() queryMajorDto: QueryMajorDto,
    @User() user: UserEntity,
  ): Promise<{ data: Major[]; total: number }> {
    return this.majorService.findAll(queryMajorDto, user);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async findMe(@User() user: UserEntity){
    return this.majorService.findMe(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.MAJOR_VIEW)
  @ApiPermissions(AppPermission.MAJOR_VIEW)
  async findOne(@Param('id') id: number): Promise<Major> {
    return this.majorService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.MAJOR_UPDATE)
  @ApiPermissions(AppPermission.MAJOR_UPDATE)
  async update(
    @Param('id') id: number,
    @Body() updateMajorDto: UpdateMajorDto,
  ): Promise<Major> {
    return this.majorService.update(id, updateMajorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.MAJOR_DELETE)
  @ApiPermissions(AppPermission.MAJOR_DELETE)
  async delete(@Param('id') id: number): Promise<Major> {
    return this.majorService.delete(id);
  }

  @Delete(':id/teacher/:teacherCode')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.MAJOR_UPDATE)
  @ApiPermissions(AppPermission.MAJOR_UPDATE)
  async deleteTeacher(
    @Param('id') id: number,
    @Param('teacherCode') teacherCode: string,
  ): Promise<Major> {
    return this.majorService.deleteTeacherToMajor(id, teacherCode);
  }

  @Post(':id/assign-teachers')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.MAJOR_UPDATE)
  @ApiPermissions(AppPermission.MAJOR_UPDATE)
  async assignTeachersToMajor(
    @Param('id') majorId: number,
    @Body() assignTeachersDto: AssignTeachersDto,
  ): Promise<Major> {
    return this.majorService.assignTeacherToMajor(majorId, assignTeachersDto);
  }


}
