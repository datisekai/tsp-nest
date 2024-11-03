import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, isNumber } from 'class-validator';

export class SubmitMultipleChoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  examQuestionId: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  examId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer: string;
}

export class SubmitCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  examQuestionId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  examId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  languageId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class RunTestCodeDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  language_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expected_output: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  source_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stdin: string;
}
