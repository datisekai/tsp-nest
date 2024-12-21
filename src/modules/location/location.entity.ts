import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Attendance } from '../attendance/attendance.entity';
import { User } from '../user/user.entity';

@Entity()
export class Location extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column('float')
  accuracy: number;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @OneToMany(() => Attendance, (entity) => entity.location)
  attendances: Attendance[];

  @ManyToOne(() => User, (entity) => entity.locations)
  user: User;
}
