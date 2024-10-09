import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Role } from '../role/role.entity';
import { UserType } from './user.dto';
import { hash } from 'bcryptjs';
import { Class } from '../class/class.entity';
import { Major } from '../major/major.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { Letter } from '../letter/letter.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Attendee } from '../attendance/attendee.entity';
@Entity()
@Unique(['code', 'deviceUid'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', select: false, nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @ManyToOne(() => Role, { nullable: true })
  role: Role;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  deviceUid: string;

  @Column({
    select: false,
    nullable: true,
    type: 'varchar',
  })
  salt: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.UNKNOWN,
  })
  type: UserType;

  @OneToMany(() => Letter, (letter) => letter.user)
  letters: Letter[];

  @ManyToMany(() => Class, (classEntity) => classEntity.users)
  @JoinTable({
    name: 'user_classes',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'class_id',
      referencedColumnName: 'id',
    },
  })
  classes: Class[];

  @ManyToMany(() => Major, (major) => major.teachers)
  @JoinTable({
    name: 'teacher_majors', // Bảng liên kết teacher và major
    joinColumn: {
      name: 'teacher_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'major_id',
      referencedColumnName: 'id',
    },
  })
  majors: Major[];

  @ManyToMany(() => Class, (classEntity) => classEntity.teachers)
  @JoinTable({
    name: 'teacher_classes', // Bảng liên kết teacher và class
    joinColumn: {
      name: 'teacher_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'class_id',
      referencedColumnName: 'id',
    },
  })
  teacherClasses: Class[];

  @OneToMany(() => Attendance, (entity) => entity.user)
  attendances: Attendance[];

  @OneToMany(() => Attendee, (entity) => entity.user)
  attendees: Attendee[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) {
      return;
    }
    this.password = await hash(this.password, 10);
  }
}
