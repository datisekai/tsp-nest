import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateNotificationDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  name: string; // Tên thông báo

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image: string; // Ảnh liên quan đến thông báo

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string; // Nội dung thông báo

  @ApiProperty()
  @IsArray()
  classIds: number[]; // ID của Class liên quan
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}

export class QueryNotificationDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  classIds?: number[];
}
