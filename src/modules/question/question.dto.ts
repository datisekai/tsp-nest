import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
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

export class QueryChapterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  majorId: string;
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

export class InitCodeDto {
  [key: string]: string; // cho phép khóa là string và giá trị là string
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

  @ApiPropertyOptional()
  @IsOptional() // Nếu bạn không cần bắt buộc
  @IsArray()
  @IsInt({ each: true }) // Kiểm tra từng phần tử trong mảng là số nguyên
  acceptedLanguages: number[];

  @ApiPropertyOptional()
  @IsOptional() // Nếu bạn không cần bắt buộc
  @ValidateNested() // Để xác thực các thuộc tính bên trong
  @Type(() => InitCodeDto) // Chuyển đổi kiểu
  initCode: InitCodeDto; // Sử dụng DTO cho initCode
}

export class CreateChapterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  majorId: number; // Chương thuộc major nào
}

export class CreateDifficultyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  level: string;
}
