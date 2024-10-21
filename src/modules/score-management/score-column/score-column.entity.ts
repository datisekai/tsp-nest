import { Class } from 'src/modules/class/class.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { StudentScore } from '../student-score/student-score.entity';

@Entity()
export class ScoreColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên cột điểm (Ví dụ: "Điểm giữa kỳ", "Điểm cuối kỳ")

  @Column({ type: 'float', default: 0 })
  weight: number; // Trọng số của cột điểm

  @ManyToOne(() => Class, (classEntity) => classEntity.scoreColumns)
  class: Class; // Cột điểm thuộc về lớp nào

  @OneToMany(() => StudentScore, (studentScore) => studentScore.scoreColumn)
  scores: StudentScore[];
}
