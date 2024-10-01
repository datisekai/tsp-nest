import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CreateUserDto, QueryUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { AppPermission, AppResource } from 'src/app.role';
import { Auth, Permissions, User } from 'src/common/decorators';
import { User as UserEntity } from './user.entity';

@ApiTags(AppResource.USER)
@UseGuards(PermissionGuard)
@Controller('api.user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth()
  @Permissions(AppPermission.USER_VIEW)
  @UsePipes(new ValidationPipe({ transform: true })) // Automatically applies validation
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.userService.findAll(queryDto);
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @Permissions(AppPermission.USER_CREATE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put('me')
  @Auth()
  @Permissions(AppPermission.USER_UPDATE_OWN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: UserEntity,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  @Put(':id')
  @Permissions(AppPermission.USER_UPDATE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions(AppPermission.USER_DELETE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
