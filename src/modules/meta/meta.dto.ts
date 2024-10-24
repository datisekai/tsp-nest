import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsJSON, IsObject } from 'class-validator';

export enum META_KEY {
  SETTING = 'setting',
  PROMPT = 'prompt',
}
export class UpdateMetaDto {
  @ApiProperty()
  @IsObject()
  value: any; // Giá trị JSON
}

export class GetMetaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string; // Meta key cần truy xuất
}
