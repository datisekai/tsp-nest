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

class UserData {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;
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
  @IsNumber()
  facultyId: number; // ID của Faculty mà Major thuộc về

  @ApiPropertyOptional({ type: [UserData] })
  @IsArray()
  @IsOptional()
  teachers?: UserData[]; // Các ID của Teacher liên quan (tùy chọn)
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
