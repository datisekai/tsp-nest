import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import {
  CreateFacultyDto,
  UpdateFacultyDto,
  QueryFacultyDto,
} from './faculty.dto';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from '../../app.role';
import { Permissions } from '../../common/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { ApiPermissions } from 'src/common/decorators/api.decorator';

@ApiTags(AppResource.FACULTY)
@Controller('api.faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.FACULTY_VIEW)
  @ApiPermissions(AppPermission.FACULTY_VIEW)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() queryFacultyDto: QueryFacultyDto) {
    return this.facultyService.findAll(queryFacultyDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.FACULTY_VIEW)
  @ApiPermissions(AppPermission.FACULTY_VIEW)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findOne(@Param('id') id: number) {
    return this.facultyService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.FACULTY_CREATE)
  @ApiPermissions(AppPermission.FACULTY_CREATE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.FACULTY_UPDATE)
  @ApiPermissions(AppPermission.FACULTY_UPDATE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: number,
    @Body() updateFacultyDto: UpdateFacultyDto,
  ) {
    return this.facultyService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.FACULTY_DELETE)
  @ApiPermissions(AppPermission.FACULTY_DELETE)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Param('id') id: number) {
    return this.facultyService.delete(id);
  }
}
