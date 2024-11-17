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

export class UserData {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;
}
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
  @IsString()
  @IsNotEmpty()
  duration: string; // ID của Major liên quan

  @ApiProperty({
    type: [UserData],
  })
  @IsArray()
  @ArrayNotEmpty()
  teacherCodes?: UserData[]; // Danh sách các teacher codes
}

class CreateClassMultiple {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string; // Tên của Class

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  majorCode: string; // ID của Major liên quan

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  duration: string; // ID của Major liên quan

  @ApiProperty({
    type: [UserData],
  })
  @IsArray()
  @ArrayNotEmpty()
  teacherCodes?: UserData[];
}

export class CreateClassMultipleDto {
  @ApiProperty({ type: [CreateClassMultiple] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  classes: CreateClassMultiple[];
}

export class AddStudentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}

export class UpdateClassDto extends PartialType(CreateClassDto) {}

export class AssignTeachersDto {
  @ApiProperty({
    type: [UserData],
  })
  @IsArray()
  @ArrayNotEmpty()
  teacherCodes: UserData[];
}

export class AssignUsersDto {
  @ApiProperty({
    type: [UserData],
  })
  @IsArray()
  @ArrayNotEmpty()
  userCodes: UserData[]; // Mảng chứa các user IDs để gán vào class
}

export class QueryClassDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Class name to search for' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Duration to search for' })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional({ description: 'Major ID to filter classes' })
  // @IsInt()
  @IsOptional()
  majorId?: number;

  @ApiPropertyOptional({
    description: 'Array of teacher IDs to filter classes',
  })
  @IsArray()
  @IsOptional()
  teacherIds?: number[];
}

export class ImportUsersDto {
  @ApiProperty({
    type: [UserData], // Đặt kiểu dữ liệu cho Swagger
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  users: UserData[];
}
