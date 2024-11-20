import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

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
  @Max(10000)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Enable or disable pagination',
    default: true,
  })
  @IsOptional()
  pagination?: string;
}
