import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsDate,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
export enum LetterStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class CreateLetterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string; // Loại đơn

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string; // Lý do đơn

  @ApiProperty()
  @IsString()
  time: string; // Lý do đơn

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  classId: number; // ID của lớp học liên quan
}

export class UpdateLetterStatusDto {
  @ApiProperty()
  @IsEnum(LetterStatus)
  status: LetterStatus; // Trạng thái đơn: chờ duyệt, đã duyệt, từ chối

  @ApiPropertyOptional()
  @IsString()
  note: string;
}

export class QueryLetterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(LetterStatus)
  status?: LetterStatus; // Lọc theo trạng thái đơn

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  classId?: number; // Lọc theo lớp học

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  userId?: number; // Lọc theo người tạo đơn

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  createdAt?: Date; // Lọc theo ngày tạo đơn

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  approvedAt?: Date; // Lọc theo ngày duyệt đơn
}
