import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  isInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

class QuestionDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  questionId: number;

  @ApiProperty()
  @IsNotEmpty()
  score: number;
}
export class CreateExamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime: Date;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  classId: number;

  @ApiProperty({ type: [QuestionDto] })
  @IsArray()
  questions?: QuestionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showResult: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  logOutTab: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  blockMouseRight: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  blockControlCVX: boolean;
}

export class UpdateExamDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  endTime?: Date;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ type: [Number] })
  classId?: number[]; // Mảng ID lớp

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [QuestionDto] })
  questions?: QuestionDto[]; // Mảng ID câu hỏi
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showResult: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  logOutTab: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  blockMouseRight: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  blockControlCVX: boolean;
}

export class ExamQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: string; // ISO 8601 format (e.g., '2024-10-01T00:00:00Z')

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime?: string; // ISO 8601 format (e.g., '2024-10-01T00:00:00Z')

  @ApiPropertyOptional()
  @IsOptional()
  classId?: number;
}

export enum CheatAction {
  OUT_TAB = 'out_tab',
  MOUSE_RIGHT = 'mouse_right',
  CTROL_CVX = 'ctrol_cvx',
}
export class ExamUserLogDto {
  @ApiProperty()
  @Matches(
    `^${Object.values(CheatAction)
      .filter((v) => typeof v !== 'number')
      .join('|')}$`,
    'i',
  )
  action: string;
}

export class ExamUserLogMultipleDto {
  @ApiProperty({ type: [ExamUserLogDto] })
  @IsArray()
  @ValidateNested({ each: true }) // Kiểm tra từng phần tử trong mảng
  @Type(() => ExamUserLogDto) // Hỗ trợ chuyển đổi kiểu dữ liệu
  data: ExamUserLogDto[];
}
