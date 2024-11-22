import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export interface Attendee {
  code: string;
  name: string;
  time: number;
}

export interface AttendanceRoom {
  id: number;
  classId: number;
  qrCode: string; // Mã QR của phòng
  expirationTime: number; // Thời gian sống của mã QR
  lastGeneratedTime: number; // Thời gian tạo mã QR gần nhất
  attendees: Attendee[];
  isOpen: boolean;
  secretKey: string;
}

export enum AttendanceMessage {
  JOIN_OR_CREATE = 'joinOrCreate',
  UPDATE_STATUS_ROOM = 'updateStatusRoom',
  CHECK_QRCODE = 'checkQRCode',
  DELETE_ROOM = 'deleteRoom',
  ROOM_STATUS_UPDATED = 'roomStatusUpdated',
  UPDATE_ATTENDEES = 'updateAttendees',
  NEW_QRCODE = 'newQRCode',
  ROOM_DELETED = 'roomDeleted',
}

export class CreateAttendanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOpen: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  time: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLink: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  classId?: number;
}

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}

export class QueryAttendanceDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isOpen?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  classId?: number;
}

export class QueryAttendeeDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  from: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  to: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  majorCode?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  majorName?: string;
}

export class CreateAttendeeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isSuccess: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  attendanceId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}

export class QueryStatisticDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;
}
