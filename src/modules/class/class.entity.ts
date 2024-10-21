import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Exam } from '../exam/exam.entity';
import { Letter } from '../letter/letter.entity';
import { Major } from '../major/major.entity';
import { Notification } from '../notification/notification.entity';
import { User } from '../user/user.entity';

@Entity()
export class Class extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên của Class

  @Column({ type: 'varchar', length: 255, nullable: true })
  duration: string;

  @ManyToMany(() => User, (teacher) => teacher.teacherClasses)
  teachers: User[];

  @ManyToOne(() => Major, (major) => major.classes)
  major: Major;

  @ManyToMany(() => User, (user) => user.classes)
  users: User[];

  @OneToMany(() => Letter, (letter) => letter.user)
  letters: Letter[];

  @OneToMany(() => Attendance, (attendance) => attendance.class)
  attendances: Attendance[];

  @ManyToMany(() => Notification, (notification) => notification.classes)
  notifications: Notification[]; // Danh sách thông báo liên quan đến lớp

  @OneToMany(() => Exam, (exam) => exam.class) // Liên kết với bài thi
  exams: Exam[];
}
