import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  isNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class SubmitMultipleChoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  examQuestionId: number;
  @ApiProperty()
  @IsNotEmpty()
  examId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer: string;
}

export class UpdateSubmissionDto {
  @ApiProperty()
  @IsNumber()
  grade: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  answer: string;
}

export class SubmitCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  examQuestionId: number;

  @ApiProperty()
  @IsNotEmpty()
  examId: number;

  @ApiProperty()
  @IsNotEmpty()
  languageId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class SubmitCodeHtmlDto {
  @ApiProperty()
  @IsNotEmpty()
  examQuestionId: number;

  @ApiProperty()
  @IsNotEmpty()
  examId: number;

  @ApiProperty()
  @IsNotEmpty()
  code: any;
}

export class RunTestCodeDto {
  @ApiProperty()
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
