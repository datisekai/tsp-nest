import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Class } from '../class/class.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { LetterStatus } from './letter.dto';

@Entity()
export class Letter extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  type: string; // Loại đơn

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string; // Loại đơn

  @Column({ type: 'text' })
  reason: string; // Lý do của đơn

  @Column({ type: 'enum', enum: LetterStatus, default: LetterStatus.PENDING })
  status: LetterStatus; // Trạng thái đơn: chờ duyệt, đã duyệt, từ chối

  @ManyToOne(() => User, (user) => user.letters)
  user: User; // Người tạo đơn

  @ManyToOne(() => Class, (classEntity) => classEntity.letters)
  class: Class; // Lớp học liên quan

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
