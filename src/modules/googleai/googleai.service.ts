import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GenerateCodeDto } from './googleai.dto';
import { MetaService } from '../meta/meta.service';
import { META_KEY } from '../meta/meta.dto';

@Injectable()
export class GoogleAIService {
  private readonly apiKey: string;
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;

  constructor(private readonly metaService: MetaService) {
    this.apiKey = process.env.GOOGLEAI_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateCode(dto: GenerateCodeDto) {
    const { input, language } = dto;
    const metaPrompt = await this.metaService.getMetaByKey(META_KEY.PROMPT);
    if (!metaPrompt || !metaPrompt?.value || !metaPrompt?.value?.data) {
      throw new NotFoundException('Prompt not found');
    }
    let prompt = metaPrompt.value.data;
    prompt = prompt.replace('{{language}}', language);
    prompt = prompt.replace('{{input}}', input);

    const result = await this.model.generateContent(prompt);

    return result.response.text();
  }
}
