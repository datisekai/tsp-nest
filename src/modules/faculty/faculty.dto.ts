import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateFacultyDto {
  @ApiProperty({ description: 'Name of the faculty' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the faculty' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateFacultyDto extends CreateFacultyDto {}

export class QueryFacultyDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Faculty name to search for' })
  @IsString()
  @IsOptional()
  name?: string;
}
