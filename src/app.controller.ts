import { Controller, Get, Render } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('COMMON')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api.health-check')
  @ApiOperation({
    summary: 'Health check',
  })
  getHealthCheck(): string {
    return 'ok';
  }

  @Get('docs/api')
  @Render('doc-api')
  @ApiOperation({
    summary: 'Docs API',
  })
  getDoc() {
    return {};
  }
}
