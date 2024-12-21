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
import { Permissions } from 'src/common/decorators';
import { AppPermission } from 'src/app.role';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Location')
@Controller('api.location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_CREATE)
  @ApiPermissions(AppPermission.LOCATION_CREATE)
  create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_VIEW)
  @ApiPermissions(AppPermission.LOCATION_VIEW)
  findAll(): Promise<Location[]> {
    return this.locationService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_VIEW)
  @ApiPermissions(AppPermission.LOCATION_VIEW)
  findOne(@Param('id') id: number): Promise<Location> {
    return this.locationService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_UPDATE)
  @ApiPermissions(AppPermission.LOCATION_UPDATE)
  update(
    @Param('id') id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LOCATION_DELETE)
  @ApiPermissions(AppPermission.LOCATION_DELETE)
  remove(@Param('id') id: number) {
    return this.locationService.remove(id);
  }
}
