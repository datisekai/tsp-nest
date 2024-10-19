import { Module } from '@nestjs/common';
import { GoogleAIController } from './googleai.controller';
import { GoogleAIService } from './googleai.service';
import { MetaModule } from '../meta/meta.module';

@Module({
  imports: [MetaModule],
  controllers: [GoogleAIController],
  providers: [GoogleAIService],
  exports: [GoogleAIService],
})
export class GoogleAIModule {}
