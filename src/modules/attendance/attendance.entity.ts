import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from '../class/class.entity';
import { User } from '../user/user.entity';
import { Attendee } from './attendee.entity';
import { Location } from '../location/location.entity';

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

  @ManyToOne(() => Class, (entity) => entity.attendances, {
    onDelete: 'CASCADE',
  })
  class: Class;

  @OneToMany(() => Attendee, (entity) => entity.attendance, {
    onDelete: 'CASCADE',
  })
  attendees: Attendee[];

  @ManyToOne(() => User, (entity) => entity.attendances)
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  time: Date;

  @Column({ type: 'int', default: 3000 })
  expirationTime: number;

  @ManyToOne(() => Location, (entity) => entity.attendances)
  location: Location;

  @Column({
    type: 'boolean',
    default: false,
  })
  isLink: boolean;
}
