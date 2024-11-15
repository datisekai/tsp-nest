import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import {User} from "../../user/user.entity";
import {Exam} from "../exam.entity";

@Entity()
@Index(['student', 'exam'])
export class ExamUserLog extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    student: User; // Sinh viên tham gia làm bài

    @ManyToOne(() => Exam, (exam) => exam.id)
    exam: Exam; // Bài kiểm tra

    @Column()
    action:string
}
