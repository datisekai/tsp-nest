import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number) // Chuyển đổi từ string sang number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number) // Chuyển đổi từ string sang number
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
