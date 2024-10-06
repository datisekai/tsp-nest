import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsJSON } from 'class-validator';

export enum META_KEY {
  SETTING = 'setting',
}
export class UpdateMetaDto {
  @ApiProperty()
  @IsJSON()
  value: any; // Giá trị JSON
}

export class GetMetaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string; // Meta key cần truy xuất
}
