import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateScoreColumnDto {
  @ApiPropertyOptional()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  weight: number;
}

export class UpdateScoreColumnDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  weight?: number;
}

export class CreateMultipleScoreColumnsDto {
  @ApiProperty()
  @IsNotEmpty()
  classId: number;

  @ApiProperty({
    type: [CreateScoreColumnDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateScoreColumnDto)
  scoreColumns: CreateScoreColumnDto[];
}

export class CreateScoreColumnMajorDto {
  @ApiProperty({
    type: [CreateMultipleScoreColumnsDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateMultipleScoreColumnsDto)
  scoreColumns: CreateMultipleScoreColumnsDto[];
}
