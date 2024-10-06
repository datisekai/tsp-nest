import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Permission } from '../permission/permission.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string; // e.g., 'admin', 'teacher', 'student'

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions', // Tên bảng liên kết
    joinColumn: {
      name: 'role_id', // Tên cột trong bảng liên kết chứa khóa chính của bảng Role
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id', // Tên cột trong bảng liên kết chứa khóa chính của bảng Permission
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}
