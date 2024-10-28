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
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto, ExamQueryDto, UpdateExamDto } from './exam.dto';
import { Exam } from './exam.entity';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions, User } from 'src/common/decorators';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { User as UserEntity } from '../user/user.entity';

@ApiTags(AppResource.EXAM)
@Controller('api.exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.EXAM_CREATE)
  @ApiPermissions(AppPermission.EXAM_CREATE)
  async create(
    @Body() createExamDto: CreateExamDto,
    @User() user: UserEntity,
  ): Promise<Exam> {
    return this.examService.create(createExamDto, user);
  }

  @Get('/public/me')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async findAllMe(
    @Query() dto: ExamQueryDto,
    @User() user: UserEntity,
  ): Promise<{ data: Exam[]; total: number }> {
    return this.examService.findAllMe(dto, user);
  }

  @Get('public/:id')
  @UseGuards(JwtAuthGuard)
  async findOnePublic(
    @Param('id') id: number,
    @User() user: UserEntity,
  ): Promise<{ data: Exam }> {
    const exam: Exam = await this.examService.joinExam(id, user);
    return { data: exam };
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.EXAM_VIEW)
  @ApiPermissions(AppPermission.EXAM_VIEW)
  async findAll(
    @Query() dto: ExamQueryDto,
    @User() user: UserEntity,
  ): Promise<{ data: Exam[]; total: number }> {
    return this.examService.findAll(dto, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.EXAM_VIEW)
  @ApiPermissions(AppPermission.EXAM_VIEW)
  async findOne(
    @Param('id') id: number,
    @User() user: UserEntity,
  ): Promise<Exam> {
    return this.examService.findOne(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.EXAM_UPDATE)
  @ApiPermissions(AppPermission.EXAM_UPDATE)
  async update(
    @Param('id') id: number,
    @Body() updateExamDto: UpdateExamDto,
    @User() user: UserEntity,
  ): Promise<Exam> {
    return this.examService.update(id, updateExamDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.EXAM_DELETE)
  @ApiPermissions(AppPermission.EXAM_DELETE)
  async remove(
    @Param('id') id: number,
    @User() user: UserEntity,
  ): Promise<Exam> {
    return this.examService.remove(id, user);
  }

  @Post('/submit/:examId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async submit(
    @Param('examId') examId: number,
    @User() user: UserEntity){
    return this.examService.updateEndTimeLog(examId, user.id);
  }
}
