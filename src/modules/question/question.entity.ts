import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Chapter } from './chapter/chapter.entity';
import { Difficulty } from './difficulty/difficulty.entity';
import { QuestionType } from './question.dto';
import { TestCase } from './testcase/testcase.entity';
import { Submission } from './submission/submission.entity';

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType; // Dạng câu hỏi

  @Column({ type: 'boolean', default: false })
  isPublic: boolean; // Trạng thái public

  @ManyToOne(() => Difficulty, (difficulty) => difficulty.id)
  difficulty: Difficulty;

  @ManyToOne(() => Chapter, (chapter) => chapter.questions)
  chapter: Chapter;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'json', nullable: true })
  choices: { text: string; isCorrect: boolean }[];

  @OneToMany(() => TestCase, (testCase) => testCase.question, { cascade: true })
  testCases: TestCase[]; // Các test case của bài tập

  @OneToMany(() => Submission, (submission) => submission.question)
  submissions: Submission[]; // Các lần nộp bài liên quan đến câu hỏi
}
