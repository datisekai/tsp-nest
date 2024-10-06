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

export class CreateMajorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string; // Tên của Major

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  facultyId: number; // ID của Faculty mà Major thuộc về

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  teacherIds?: number[]; // Các ID của Teacher liên quan (tùy chọn)
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

  @ApiPropertyOptional({ description: 'Array of teacher IDs to filter majors' })
  @IsArray()
  @IsOptional()
  teacherIds?: number[];
}

export class AssignTeachersDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  teacherCodes: string[];
}
