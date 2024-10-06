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
import { LetterService } from './letter.service';
import {
  CreateLetterDto,
  QueryLetterDto,
  UpdateLetterStatusDto,
} from './letter.dto';
import { Letter } from './letter.entity';
import { AppPermission, AppResource } from '../..//app.role';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions, User } from 'src/common/decorators';
import { ApiPermissions } from 'src/common/decorators/api.decorator';
import { User as UserEntity } from '../user/user.entity';

@ApiTags(AppResource.LETTER)
@Controller('api.letter')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createLetterDto: CreateLetterDto,
    @User() user: UserEntity,
  ): Promise<Letter> {
    return this.letterService.create(createLetterDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LETTER_VIEW)
  @ApiPermissions(AppPermission.LETTER_VIEW)
  async findAll(
    @Query() queryLetterDto: QueryLetterDto,
  ): Promise<{ data: Letter[]; total: number }> {
    return this.letterService.findAll(queryLetterDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LETTER_VIEW_OWN)
  @ApiPermissions(AppPermission.LETTER_VIEW_OWN)
  async findLettersByTeacher(
    @Query() queryLetterDto: QueryLetterDto,
    @User() user: UserEntity,
  ): Promise<{ data: Letter[]; total: number }> {
    return this.letterService.findLettersByTeacher(user.id, queryLetterDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LETTER_VIEW, AppPermission.LETTER_VIEW_OWN)
  @ApiPermissions(AppPermission.LETTER_VIEW, AppPermission.LETTER_VIEW_OWN)
  async findOne(@Param('id') id: number): Promise<Letter> {
    return this.letterService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.LETTER_UPDATE)
  @ApiPermissions(AppPermission.LETTER_UPDATE)
  async updateStatus(
    @Param('id') id: number,
    @Body() updateLetterStatusDto: UpdateLetterStatusDto,
  ): Promise<Letter> {
    return this.letterService.updateStatus(id, updateLetterStatusDto);
  }

  @Get('public/me')
  @UseGuards(JwtAuthGuard)
  async findMyLetters(
    @User() user: UserEntity,
    @Query() queryLetterDto: QueryLetterDto,
  ): Promise<{ data: Letter[]; total: number }> {
    return this.letterService.findMyLetters(user.id, queryLetterDto);
  }
}
