import { Controller, Get, Post, Render, Request, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api.health-check')
  @ApiOperation({
    summary: 'Health check',
  })
  getHealthCheck(@Request() req): string {
    return 'ok';
  }

  @Get('docs/api')
  @Render('doc-api')
  @ApiOperation({
    summary: 'Docs API',
  })
  getDoc(@Res() res: Response) {
    return {};
  }
}
