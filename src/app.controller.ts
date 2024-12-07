import { Controller, Get, Render } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
