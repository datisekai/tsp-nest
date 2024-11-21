import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from '../question.entity';

@Entity()
export class Difficulty extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  level: string; // Ví dụ: Dễ, Trung bình, Khó

  @OneToMany(() => Question, (question) => question.difficulty)
  questions: Question[];
}
