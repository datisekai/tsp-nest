import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Question } from '../question.entity';
import { User } from '../../user/user.entity';

@Entity()
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User; // Sinh viên nộp bài

  @ManyToOne(() => Question)
  question: Question; // Câu hỏi mà sinh viên nộp

  @Column({ type: 'varchar', length: 50, nullable: true })
  language?: string; // Ngôn ngữ lập trình (nếu là bài tập lập trình)

  @Column({ type: 'text', nullable: true })
  code?: string; // Mã code mà sinh viên nộp (nếu là bài tập lập trình)

  @Column({ type: 'varchar', length: 255, nullable: true })
  answer?: string; // Đáp án của sinh viên (nếu là câu hỏi trắc nghiệm)

  @Column({ type: 'boolean', default: false })
  result?: boolean; // Kết quả từ Judge0 hoặc kiểm tra trắc nghiệm (bao gồm trạng thái, thời gian chạy, vv.)
}
