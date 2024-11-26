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
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum UserType {
  TEACHER = 'teacher',
  STUDENT = 'student',
  MASTER = 'master',
  UNKNOWN = 'unknown',
}
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  code: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
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
  deviceUid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classCode?: string;

  @ApiPropertyOptional({
    enum: UserType,
    description: 'Type of user (teacher or student or master)',
  })
  @IsEnum(UserType)
  @IsOptional()
  type?: UserType;
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

export class SearchUserDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: UserType,
    description: 'Filter by user type (teacher or student)',
  })
  @IsEnum(UserType)
  @IsOptional()
  type?: UserType; // Thêm field để tìm kiếm theo type
}

export class QueryTeacherDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
