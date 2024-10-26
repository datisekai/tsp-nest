import {
  Column,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Question } from '../question/question.entity';
import { Class } from '../class/class.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Submission } from '../question/submission/submission.entity';
import { User } from '../user/user.entity';

@Entity()
export class Exam extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @ManyToOne(() => Class, (classEntity) => classEntity.exams)
  @JoinTable() // Tạo bảng liên kết giữa Exam và Class
  class: Class;

  @ManyToMany(() => Question, (question) => question.exams)
  @JoinTable() // Tạo bảng liên kết giữa Exam và Question
  questions: Question[];

  @OneToMany(() => Submission, (s) => s.exam)
  submissions: Submission[];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
}
