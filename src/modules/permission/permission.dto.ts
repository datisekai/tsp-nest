import { PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  action: string; // e.g., 'view', 'edit', 'delete', 'create'

  @IsString()
  @IsOptional()
  resource?: string; // e.g., 'User', 'Post'

  @IsNotEmpty()
  roleId: number; // Foreign key for Role
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

export class QueryPermissionDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  roleId?: number;
}
