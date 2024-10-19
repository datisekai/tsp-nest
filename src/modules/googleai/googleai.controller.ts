import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GoogleAIService } from './googleai.service';
import { removeCodeFencing } from 'src/common/helpers/removeCodeFencing';
import { GenerateCodeDto } from './googleai.dto';
import { JwtAuthGuard } from '../auth/guards';
import { ApiTags } from '@nestjs/swagger';
import { AppResource } from 'src/app.role';

@ApiTags(AppResource.GOOGLEAI)
@Controller('api.googleai')
export class GoogleAIController {
  constructor(private readonly googleAIService: GoogleAIService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async generateResponse(@Body() dto: GenerateCodeDto) {
    const codeFencing = await this.googleAIService.generateCode(dto);

    return { data: removeCodeFencing(codeFencing) };
  }
}
