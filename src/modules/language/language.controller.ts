import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppResource } from 'src/app.role';
import { Judge0Service } from '../judge0/judge0.service';
import { JwtAuthGuard } from '../auth/guards';

@ApiTags(AppResource.LANGUAGE)
@Controller('api.language')
export class LanguageController {
  constructor(private readonly judge0Service: Judge0Service) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const languages = await this.judge0Service.getLanguages();
    return { data: languages };
  }
}
