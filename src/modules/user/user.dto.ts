import { PartialType } from '@nestjs/mapped-types';

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
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  code: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  roleId?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  device_uid?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class QueryUserDto extends PaginationDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  device_uid?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
