import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  Length,
  IsNotEmpty,
  IsInt,
  Min,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum UserType {
  TEACHER = 'teacher',
  STUDENT = 'student',
}
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  code: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  roleId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  device_uid?: string;

  @ApiPropertyOptional({
    enum: UserType,
    description: 'Type of user (teacher or student)',
  })
  @IsEnum(UserType)
  @IsOptional()
  type?: UserType; // Thêm type để phân loại teacher hoặc student
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceUid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    enum: UserType,
    description: 'Filter by user type (teacher or student)',
  })
  @IsEnum(UserType)
  @IsOptional()
  type?: UserType; // Thêm field để tìm kiếm theo type
}
