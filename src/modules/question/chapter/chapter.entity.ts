import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Major } from '../../major/major.entity';
import { Question } from '../question.entity';
import { User } from 'src/modules/user/user.entity';

@Entity()
export class Chapter extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên của chương

  @ManyToOne(() => Major, (major) => major.chapters)
  major: Major; // Liên kết với Major

  @OneToMany(() => Question, (question) => question.chapter)
  questions: Question[]; // Các câu hỏi trong chương

  @ManyToOne(() => User)
  user: User; // Sinh viên nộp bài
}
