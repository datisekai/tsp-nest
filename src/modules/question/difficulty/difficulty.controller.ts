import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { DifficultyService } from './difficulty.service';
import { CreateDifficultyDto } from '../question.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { Permissions } from 'src/common/decorators';
import { ApiPermissions } from 'src/common/decorators/api.decorator';

@ApiTags(AppResource.DIFFICULTY)
@Controller('api.difficulty')
export class DifficultyController {
  constructor(private difficultyService: DifficultyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.DIFFICULTY_CREATE)
  @ApiPermissions(AppPermission.DIFFICULTY_CREATE)
  async createDifficulty(@Body() createDifficultyDto: CreateDifficultyDto) {
    return this.difficultyService.createDifficulty(createDifficultyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.DIFFICULTY_DELETE)
  @ApiPermissions(AppPermission.DIFFICULTY_DELETE)
  async deleteDifficulty(@Param('id') id: number) {
    return this.difficultyService.deleteDifficulty(id);
  }

  @Get()
  async getAllDifficulties() {
    return this.difficultyService.getAllDifficulties();
  }
}
