import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import {User} from "../../user/user.entity";
import {Exam} from "../exam.entity";

@Entity()
export class ExamLog extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    student: User; // Sinh viên tham gia làm bài

    @ManyToOne(() => Exam, (exam) => exam.id)
    exam: Exam; // Bài kiểm tra

    @Column({ type: 'timestamp', nullable: true })
    startTime: Date; // Thời gian bắt đầu làm bài

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date; // Thời gian kết thúc làm bài
}
