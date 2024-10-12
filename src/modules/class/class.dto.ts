import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateClassDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string; // Tên của Class

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  majorId: number; // ID của Major liên quan

  @ApiProperty()
  @IsArray()
  @IsArray()
  @ArrayNotEmpty()
  teacherCodes?: string[]; // Danh sách các teacher codes
}

export class UpdateClassDto extends PartialType(CreateClassDto) {}

export class AssignTeachersDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  teacherCodes: string[];
}

export class AssignUsersDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  userCodes: string[]; // Mảng chứa các user IDs để gán vào class
}

export class QueryClassDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Class name to search for' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Major ID to filter classes' })
  @IsInt()
  @IsOptional()
  majorId?: number;

  @ApiPropertyOptional({
    description: 'Array of teacher IDs to filter classes',
  })
  @IsArray()
  @IsOptional()
  teacherIds?: number[];
}

class UserData {
  @IsString()
  code: string;

  @IsString()
  name: string;
}

export class ImportUsersDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  users: UserData[];
}
