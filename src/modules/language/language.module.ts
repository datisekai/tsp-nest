import { Module } from '@nestjs/common';
import { LanguageController } from './language.controller';
import { Judge0Service } from '../judge0/judge0.service';

@Module({
  imports: [],
  controllers: [LanguageController],
  providers: [Judge0Service],
  exports: [Judge0Service],
})
export class LanguageModule {}
