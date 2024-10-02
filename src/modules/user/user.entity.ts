import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Role } from '../role/role.entity';
@Entity()
@Unique(['code', 'deviceUid'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @ManyToOne(() => Role, { nullable: true })
  role: Role;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  deviceUid: string;

  @Column({
    select: false,
    nullable: true,
    type: 'varchar',
  })
  salt: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
