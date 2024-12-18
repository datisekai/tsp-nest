import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class CreateStudentScoreDto {
  @ApiProperty()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty()
  @IsNotEmpty()
  scoreColumnId: number;

  @ApiProperty()
  @IsNotEmpty()
  score: number;
}

export class CreateMultipleStudentScoreDto {
  @ApiProperty({
    type: [CreateStudentScoreDto], // Đặt kiểu dữ liệu cho Swagger
  })
  @ValidateNested({ each: true })
  @Type(() => CreateStudentScoreDto)
  @IsArray()
  studentScore: CreateStudentScoreDto[];
}
