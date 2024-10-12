import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

interface Attendee {
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
  CREATE_ROOM = 'createRoom',
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

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}

export class QueryAttendanceDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  createdAt: string;
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
