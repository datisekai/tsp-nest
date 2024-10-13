import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
  @IsBoolean()
  @Type(() => Boolean) // Chuyển đổi query param thành kiểu boolean
  pagination?: boolean = true;
}
