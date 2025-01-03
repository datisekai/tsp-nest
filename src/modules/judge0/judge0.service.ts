import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Judge0Submit, SubmitJudge0Dto } from './judge0.dto';
import axios from 'axios';
import { encode } from 'js-base64';

@Injectable()
export class Judge0Service {
  private judgeUrl: string;
  private xAuthToken: string;
  constructor() {
    this.judgeUrl = process.env.JUDGE0_URL;
    this.xAuthToken = process.env.JUDGE0_API_KEY;
  }

  async submitCode(dto: SubmitJudge0Dto): Promise<Judge0Submit> {
    if (!this.judgeUrl || !this.xAuthToken)
      throw new NotFoundException('Judge0 URL or API key not found');
    const { source_code, language_id, stdin, expected_output } = dto;
    const response = await axios.post(
      `${this.judgeUrl}/submissions?base64_encoded=true&wait=true&base64_encoded=true`,
      {
        source_code: encode(source_code),
        language_id,
        stdin: encode(stdin),
        expected_output: encode(expected_output),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': this.xAuthToken,
        },
      },
    );

    return response.data;
  }

  async testCode(dto: SubmitJudge0Dto): Promise<Judge0Submit> {
    if (!this.judgeUrl || !this.xAuthToken)
      throw new NotFoundException('Judge0 URL or API key not found');
    const { source_code, language_id, stdin, expected_output } = dto;
    const response = await axios.post(
      `${this.judgeUrl}/submissions?wait=true&base64_encoded=true`,
      {
        source_code,
        language_id,
        stdin,
        expected_output,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': this.xAuthToken,
        },
      },
    );

    return response.data;
  }

  async getLanguages() {
    const whileListLanguage = [50, 54, 51, 62, 63, 64, 68, 70, 74, 72];
    if (!this.judgeUrl || !this.xAuthToken)
      throw new NotFoundException('Judge0 URL or API key not found');
    try {
      const response = await axios.get(`${this.judgeUrl}/languages`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': this.xAuthToken,
        },
      });

      const languages = response.data.filter((language) =>
        whileListLanguage.includes(language.id),
      );
      return languages;
    } catch (error) {
      console.log('error', error);
      return [];
    }
  }
}
