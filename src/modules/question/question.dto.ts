import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  CODE = 'code',
}

export class CreateChoiceDto {
  text: string;
  isCorrect: boolean;
}

export class UpdateChoiceDto {
  text?: string;
  isCorrect?: boolean;
}

export class QueryQuestionDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string; // Lọc theo tiêu đề câu hỏi

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean; // Lọc theo trạng thái công khai
}

export class CreateTestCaseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  input: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  expectedOutput: string;
}

export class CreateUpdateQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(QuestionType) // Sử dụng @IsEnum để validate enum
  type: QuestionType; // Dùng enum ở đây

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  difficultyId: number; // ID độ khó

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  chapterId: number; // ID chương

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  choices: { text: string; isCorrect: boolean }[]; // Đáp án cho câu hỏi trắc nghiệm

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  testCases?: { input: string; expectedOutput: string }[]; // Test case cho câu hỏi viết code
}

export class CreateChapterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  majorId: number; // Chương thuộc major nào
}

export class CreateDifficultyDto {
  @IsNotEmpty()
  @IsString()
  level: string;
}
