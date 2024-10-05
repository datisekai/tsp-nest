import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './role.dto';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from '../../app.role';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../../common/decorators';
import { QueryUserDto } from '../user/user.dto';

@ApiTags(AppResource.ROLE)
@Controller('api.role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ROLE_VIEW)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.roleService.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ROLE_VIEW)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findOne(@Param('id') id: number) {
    return this.roleService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ROLE_CREATE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ROLE_UPDATE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ROLE_DELETE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Param('id') id: number) {
    return this.roleService.delete(id);
  }

  @Put(':id/permissions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.ROLE_ASSIGN_PERMISSION)
  @UsePipes(new ValidationPipe({ transform: true }))
  async assignPermissionsToRole(
    @Param('id') roleId: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissionsToRole(
      roleId,
      assignPermissionsDto,
    );
  }
}
