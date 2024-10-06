import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Class } from '../class/class.entity';
import { User } from '../user/user.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên thông báo

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string; // Ảnh liên quan đến thông báo

  @Column({ type: 'text' })
  content: string; // Nội dung thông báo

  // Mối quan hệ với Class (1 Class có nhiều Notification)
  @ManyToOne(() => Class, (classEntity) => classEntity.notifications)
  class: Class;

  // Mối quan hệ với User (1 User tạo nhiều Notification)
  @ManyToOne(() => User, { nullable: false })
  creator: User; // Người tạo thông báo

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
