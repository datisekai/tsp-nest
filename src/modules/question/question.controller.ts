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
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { QuestionService } from './question.service';
import { CreateUpdateQuestionDto, QueryQuestionDto } from './question.dto';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { Permissions, User } from 'src/common/decorators';
import { User as UserEntity } from '../user/user.entity';
import { Question } from './question.entity';

@ApiTags(AppResource.QUESTION)
@Controller('api.question')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.QUESTION_VIEW)
  @ApiPermissions(AppPermission.QUESTION_VIEW)
  async getQuestions(
    @Query() filterDto: QueryQuestionDto,
    @User() user: UserEntity,
  ) {
    return this.questionService.getAll(filterDto, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.QUESTION_CREATE)
  @ApiPermissions(AppPermission.QUESTION_CREATE)
  async createQuestion(
    @Body() createQuestionDto: CreateUpdateQuestionDto,
  ): Promise<Question> {
    return this.questionService.createQuestion(createQuestionDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.QUESTION_VIEW)
  @ApiPermissions(AppPermission.QUESTION_VIEW)
  async getQuestionById(
    @Param('id') id: number,
    @User() user: UserEntity,
  ): Promise<Question> {
    return this.questionService.getQuestionById(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.QUESTION_UPDATE)
  @ApiPermissions(AppPermission.QUESTION_UPDATE)
  async updateQuestion(
    @Param('id') id: number,
    @Body() updateQuestionDto: CreateUpdateQuestionDto,
    @User() user: UserEntity,
  ): Promise<Question> {
    return this.questionService.updateQuestion(id, updateQuestionDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.QUESTION_DELETE)
  @ApiPermissions(AppPermission.QUESTION_DELETE)
  async deleteQuestion(
    @Param('id') id: number,
    @User() user: UserEntity,
  ): Promise<Question> {
    return this.questionService.deleteQuestion(id, user);
  }
}
