import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Class } from '../class/class.entity';
import { Faculty } from '../faculty/faculty.entity';
import { User } from '../user/user.entity';

@Entity()
export class Major extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên của Major

  @ManyToOne(() => Faculty, (faculty) => faculty.majors)
  faculty: Faculty;

  @OneToMany(() => Class, (classEntity) => classEntity.major)
  classes: Class[];

  @ManyToMany(() => User, (teacher) => teacher.majors)
  teachers: User[];
}
