import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, isNumber } from 'class-validator';

export class SubmitMultipleChoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  questionId: number;
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
  questionId: number;

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
