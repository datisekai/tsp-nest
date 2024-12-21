import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { Location } from './location.entity';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions, User } from 'src/common/decorators';
import { AppPermission } from 'src/app.role';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { ApiTags } from '@nestjs/swagger';
import { User as UserEntity } from '../user/user.entity';

@ApiTags('Location')
@Controller('api.location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_CREATE)
  @ApiPermissions(AppPermission.LOCATION_CREATE)
  async create(
    @Body() createLocationDto: CreateLocationDto,
    @User() user: UserEntity,
  ) {
    const created = await this.locationService.create(createLocationDto, user);
    return { data: created };
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_VIEW)
  @ApiPermissions(AppPermission.LOCATION_VIEW)
  async findAll() {
    const locations = await this.locationService.findAll();
    return { data: locations };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_VIEW)
  @ApiPermissions(AppPermission.LOCATION_VIEW)
  async findOne(@Param('id') id: number) {
    const location = await this.locationService.findOne(id);
    return { data: location };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_UPDATE)
  @ApiPermissions(AppPermission.LOCATION_UPDATE)
  async update(
    @Param('id') id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    const location = await this.locationService.update(id, updateLocationDto);
    return { data: location };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_DELETE)
  @ApiPermissions(AppPermission.LOCATION_DELETE)
  async remove(@Param('id') id: number) {
    const location = await this.locationService.remove(id);
    return { data: location };
  }
}
