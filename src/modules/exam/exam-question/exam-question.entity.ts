import {
    Column,
    Entity,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {Exam} from "../exam.entity";
import {Question} from "../../question/question.entity";
import {BaseEntity} from "../../../common/entities/base.entity";
import {Submission} from "../../question/submission/submission.entity";

@Entity()
export class ExamQuestion extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Exam, (exam) => exam.examQuestions)
    exam: Exam;

    @OneToMany(() => Submission, (submission) => submission.examQuestion)
    submissions: Submission[];

    @ManyToOne(() => Question, (question) => question.examQuestions)
    question: Question;

    @Column({ type: 'float' })
    score: number; // Điểm riêng cho mỗi câu hỏi
}
