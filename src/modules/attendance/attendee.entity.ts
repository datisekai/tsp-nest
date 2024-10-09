import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Attendance } from './attendance.entity';

@Entity()
export class Attendee extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  isSuccess: boolean;

  @ManyToOne(() => Attendance, (entity) => entity.attendees)
  attendance: Attendance;

  @ManyToOne(() => User, (entity) => entity.attendees)
  user: User;
}
