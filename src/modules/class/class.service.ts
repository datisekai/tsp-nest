import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MajorService } from '../major/major.service';
import { UserService } from '../user/user.service';
import { Class } from './class.entity';
import {
  AssignTeachersDto,
  AssignUsersDto,
  CreateClassDto,
  UpdateClassDto,
  QueryClassDto,
  ImportUsersDto,
} from './class.dto';
import { User } from '../user/user.entity';
import { UserType } from '../user/user.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    private readonly majorService: MajorService,
    private readonly userService: UserService,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const { name, majorId, teacherCodes } = createClassDto;

    const major = await this.majorService.findOne(majorId);
    if (!major) {
      throw new NotFoundException(`Major with ID ${majorId} not found`);
    }

    const teachers = teacherCodes
      ? await this.userService.findOrCreateUsersByCodes(
          teacherCodes.map((item) => ({ code: item })),
        )
      : [];

    const classEntity = this.classRepository.create({
      name,
      major,
      teachers,
    });

    return this.classRepository.save(classEntity);
  }

  async findAll(
    queryClassDto: QueryClassDto,
    user: User,
  ): Promise<{ data: Class[]; total: number }> {
    const {
      name,
      majorId,
      teacherIds,
      page = 1,
      limit = 10,
      pagination,
    } = queryClassDto;

    const queryBuilder = this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.major', 'major')
      .leftJoinAndSelect('class.teachers', 'teacher');

    if (user.type !== UserType.MASTER) {
      queryBuilder.andWhere('teacher.id = :userId', { userId: user.id });
    }

    if (name) {
      queryBuilder.andWhere('class.name LIKE :name', { name: `%${name}%` });
    }

    if (majorId) {
      queryBuilder.andWhere('class.major.id = :majorId', { majorId });
    }

    if (teacherIds && teacherIds.length > 0) {
      queryBuilder.andWhere('teacher.id IN (:...teacherIds)', { teacherIds });
    }

    if (pagination) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const [data, total] = await queryBuilder
      .orderBy('class.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['major', 'teachers', 'users'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const { name, majorId, teacherCodes } = updateClassDto;

    const classEntity = await this.findOne(id);
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    if (name) classEntity.name = name;

    if (majorId) {
      const major = await this.majorService.findOne(majorId);
      if (!major) {
        throw new NotFoundException(`Major with ID ${majorId} not found`);
      }
      classEntity.major = major;
    }

    if (teacherCodes) {
      const teachers = await this.userService.findOrCreateUsersByCodes(
        teacherCodes.map((item) => ({ code: item })),
      );
      classEntity.teachers = teachers;
    }

    return this.classRepository.save(classEntity);
  }

  async delete(id: number): Promise<Class> {
    const classEntity = await this.findOne(id);
    return await this.classRepository.remove(classEntity);
  }

  async assignTeachersToClass(
    classId: number,
    assignTeachersDto: AssignTeachersDto,
  ): Promise<Class> {
    const { teacherCodes } = assignTeachersDto;

    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['teachers'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const teachers = await this.userService.findOrCreateUsersByCodes(
      teacherCodes.map((item) => ({ code: item })),
    );

    const teacherSet = new Set(
      classEntity.teachers.map((teacher) => teacher.id),
    );
    teachers.forEach((teacher) => teacherSet.add(teacher.id));

    const uniqueTeachers = await this.userService.findByIds(
      Array.from(teacherSet),
    );

    classEntity.teachers = uniqueTeachers;

    return this.classRepository.save(classEntity);
  }

  async assignUsersToClass(
    classId: number,
    assignUsersDto: AssignUsersDto,
  ): Promise<Class> {
    const { userCodes } = assignUsersDto;

    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['users'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const users = await this.userService.findOrCreateUsersByCodes(
      userCodes.map((item) => ({ code: item })),
    );

    const userSet = new Set(classEntity.users.map((user) => user.id));
    users.forEach((user) => userSet.add(user.id));

    const uniqueUsers = await this.userService.findByIds(Array.from(userSet));

    classEntity.users = uniqueUsers;

    return this.classRepository.save(classEntity);
  }

  async importUsers(
    classId: number,
    importUsersDto: ImportUsersDto,
  ): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['users'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const users = await this.userService.findOrCreateUsersByCodes(
      importUsersDto.users,
    );

    classEntity.users = [...classEntity.users, ...users];

    return this.classRepository.save(classEntity);
  }

  async importTeachers(
    classId: number,
    importTeachersDto: ImportUsersDto,
  ): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['teachers'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const teachers = await this.userService.findOrCreateUsersByCodes(
      importTeachersDto.users,
    );

    classEntity.teachers = [...classEntity.teachers, ...teachers];

    return this.classRepository.save(classEntity);
  }

  async checkExistedUser(classId: number, userId: number) {
    const classExist = await this.findOne(classId);

    // Kiểm tra xem userId có nằm trong danh sách người dùng của lớp không
    const userExists = classExist.users.some((user) => user.id === userId);

    return userExists; // Trả về true nếu người dùng tồn tại, ngược lại false
  }
}
