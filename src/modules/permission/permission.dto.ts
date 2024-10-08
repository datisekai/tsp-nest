import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action: string; // e.g., 'view', 'edit', 'delete', 'create'

  @ApiProperty()
  @IsString()
  @IsOptional()
  resource?: string; // e.g., 'User', 'Post'
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

export class QueryPermissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  roleId?: number;
}
