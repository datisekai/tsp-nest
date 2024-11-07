import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Type } from 'class-transformer';

export class CreateFacultyDto {
  @ApiProperty({ description: 'Name of the faculty' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Description of the faculty' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateFacultyMultipleDto {
  @ApiProperty({ type: [CreateFacultyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacultyDto)
  faculties: CreateFacultyDto[];
}

export class UpdateFacultyDto extends CreateFacultyDto {}

export class QueryFacultyDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Faculty name to search for' })
  @IsString()
  @IsOptional()
  name?: string;
}
