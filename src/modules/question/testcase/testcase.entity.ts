import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../question.entity';

@Entity()
export class TestCase extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  input: string; // Input đầu vào cho bài tập

  @Column({ type: 'text' })
  expectedOutput: string; // Output mong muốn

  @Column({ type: 'boolean', default: false })
  isHidden: boolean; // Test case ẩn (sinh viên không thấy)

  @ManyToOne(() => Question, (question) => question.testCases)
  question: Question; // Liên kết với bài tập
}
