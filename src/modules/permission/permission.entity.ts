import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../role/role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  action: string; // e.g., 'view', 'edit', 'delete', 'create'

  @Column({ type: 'varchar', nullable: true })
  resource: string; // e.g., 'User', 'Post'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // This side of the many-to-many relationship is passive (doesn't define JoinTable)
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
