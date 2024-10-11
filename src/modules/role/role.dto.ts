import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class AssignPermissionsDto {
  @ApiProperty({
    type: [Number],
    description: 'Array of Permission IDs to assign to the role',
  })
  @IsArray()
  // @ArrayNotEmpty()
  permissionIds: number[];
}

export class QueryRoleDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Role name to search for' })
  @IsString()
  @IsOptional()
  name?: string;
}
