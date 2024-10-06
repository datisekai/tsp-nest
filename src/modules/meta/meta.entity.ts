import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Meta extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  key: string; // Tên của Meta key, ví dụ: 'setting'

  @Column({ type: 'simple-json' })
  value: any; // Giá trị dạng JSON
}
