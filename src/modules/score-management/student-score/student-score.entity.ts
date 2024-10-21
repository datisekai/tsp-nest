import { User } from 'src/modules/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ScoreColumn } from '../score-column/score-column.entity';

@Entity()
export class StudentScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.studentScores)
  student: User; // Sinh viên

  @ManyToOne(() => ScoreColumn, (scoreColumn) => scoreColumn.scores)
  scoreColumn: ScoreColumn; // Cột điểm

  @Column({ type: 'float' })
  score: number; // Điểm số
}
