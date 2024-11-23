import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Question } from '../question.entity';
import { User } from '../../user/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Exam } from 'src/modules/exam/exam.entity';
import { ExamQuestion } from '../../exam/exam-question/exam-question.entity';

@Entity()
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User; // Sinh viên nộp bài

  @ManyToOne(() => ExamQuestion)
  examQuestion: ExamQuestion; // Câu hỏi mà sinh viên nộp

  @ManyToOne(() => Exam)
  exam: Exam; // Câu hỏi mà sinh viên nộp

  @Column({ type: 'int', nullable: true })
  languageId: number; // Ngôn ngữ lập trình (nếu là bài tập lập trình)

  @Column({ type: 'text', nullable: true })
  code?: string; // Mã code mà sinh viên nộp (nếu là bài tập lập trình)

  @Column({ type: 'varchar', length: 255, nullable: true })
  answer?: string; // Đáp án của sinh viên (nếu là câu hỏi trắc nghiệm)

  @Column({ type: 'simple-json', nullable: true })
  codeHtml: any;

  @Column({ type: 'simple-json', nullable: true })
  resultJudge0: any;

  @Column({ type: 'simple-json', nullable: true })
  questionTemp: any;

  @Column({ type: 'float', default: 0 })
  grade?: number; // Kết quả từ Judge0 hoặc kiểm tra trắc nghiệm (bao gồm trạng thái, thời gian chạy, vv.)
}
