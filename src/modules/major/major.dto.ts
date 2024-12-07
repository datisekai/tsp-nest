import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  IsInt,
  ArrayNotEmpty,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class UserData {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classCode: string;
}
export class CreateMajorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string; // Tên của Major

  @ApiProperty()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  facultyId: number; // ID của Faculty mà Major thuộc về

  @ApiPropertyOptional({ type: [UserData] })
  @IsArray()
  @IsOptional()
  teachers?: UserData[]; // Các ID của Teacher liên quan (tùy chọn)
}

class CreateMultipleMajor {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string; // Tên của Major

  @ApiProperty()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  facultyCode: string; // ID của Faculty mà Major thuộc về

  @ApiPropertyOptional({ type: [UserData] })
  @IsArray()
  @IsOptional()
  teachers?: UserData[]; // Các ID của Teacher liên quan (tùy chọn)
}

export class CreateMultipleMajorDto {
  @ApiProperty({ type: [CreateMultipleMajor] })
  @IsArray()
  @ArrayNotEmpty()
  majors: CreateMultipleMajor[];
}

export class UpdateMajorDto extends PartialType(CreateMajorDto) {}

export class QueryMajorDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Major name to search for' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Faculty ID to filter majors' })
  @IsInt()
  @IsOptional()
  facultyId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: 'Array of teacher Codes to filter majors',
    type: [UserData],
  })
  @IsArray()
  @IsOptional()
  teacherCodes: string[];
}

export class AssignTeachersDto {
  @ApiProperty({ type: [UserData] })
  @IsArray()
  @ArrayNotEmpty()
  teacherCodes: UserData[];
}
