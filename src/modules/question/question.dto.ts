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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chapterId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  difficultyId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  majorId: string

  @ApiPropertyOptional({description:'questionType is multiple_choice or code'})
  @IsOptional()
  @IsString()
  questionType?: string
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

export class Choice {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}

export class Input {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  input: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
  @Type(() => Number)
  @IsNumber()
  difficultyId: number; // ID độ khó

  @IsNotEmpty()
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  chapterId: number; // ID chương

  @IsNotEmpty()
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  majorId: number; // ID chương

  @ApiPropertyOptional({ type: [Choice] })
  @IsOptional()
  @IsArray()
  choices: Choice[]; // Đáp án cho câu hỏi trắc nghiệm

  @ApiPropertyOptional({ type: [Input] })
  @IsOptional()
  @IsArray()
  testCases?: Input[]; // Test case cho câu hỏi viết code

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional() // Nếu bạn không cần bắt buộc
  @IsArray()
  @IsInt({ each: true }) // Kiểm tra từng phần tử trong mảng là số nguyên
  acceptedLanguages: number[];

  @ApiPropertyOptional({ type: InitCodeDto })
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
