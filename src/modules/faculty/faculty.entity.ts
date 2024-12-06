import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Major } from '../major/major.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Faculty extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  code: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => Major, (major) => major.faculty)
  majors: Major[];
}
