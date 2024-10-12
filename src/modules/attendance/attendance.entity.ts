import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from '../class/class.entity';
import { User } from '../user/user.entity';
import { Attendee } from './attendee.entity';

@Entity()
export class Attendance extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'boolean', default: false })
  isOpen: boolean;

  @Column({ type: 'varchar' })
  secretKey: string;

  @ManyToOne(() => Class, (entity) => entity.attendances)
  class: Class;

  @OneToMany(() => Attendee, (entity) => entity.attendance)
  attendees: Attendee[];

  @ManyToOne(() => User, (entity) => entity.attendances)
  user: User;
}
