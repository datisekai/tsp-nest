import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MajorService } from '../major/major.service';
import { UserType } from '../user/user.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import {
  AddStudentDto,
  AssignTeachersDto,
  AssignUsersDto,
  CreateClassDto,
  CreateClassMultipleDto,
  ImportUsersDto,
  QueryClassDto,
  UpdateClassDto,
} from './class.dto';
import { Class } from './class.entity';
import { randomString } from 'src/common/helpers/randomString';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    private readonly majorService: MajorService,
    private readonly userService: UserService,
  ) {}

  async createMultiple(dto: CreateClassMultipleDto): Promise<Class[]> {
    const newClasses = [];
    for (const item of dto.classes) {
      const major = await this.majorService.findByCode(item.majorCode);
      if (major) {
        const newClass = this.classRepository.create(item);
        newClass.major = major;
        newClass.teachers = await this.userService.findOrCreateUsersByCodes(
          item.teacherCodes,
          UserType.TEACHER,
        );
        newClasses.push(newClass);
      }
    }

    return await this.classRepository.save(newClasses);
  }

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const { name, majorId, teacherCodes, duration } = createClassDto;

    const major = await this.majorService.findOne(majorId);
    if (!major) {
      throw new NotFoundException(`Major with ID ${majorId} not found`);
    }

    const teachers = teacherCodes
      ? await this.userService.findOrCreateUsersByCodes(
          teacherCodes,
          UserType.TEACHER,
        )
      : [];

    const classEntity = this.classRepository.create({
      name,
      major,
      teachers,
      duration,
      secretKey: randomString(6),
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
      duration,
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

    if (duration) {
      queryBuilder.andWhere('class.duration LIKE :duration', {
        duration: `%${duration}%`,
      });
    }

    if (majorId) {
      queryBuilder.andWhere('class.major.id = :majorId', { majorId });
    }

    if (teacherIds && teacherIds.length > 0) {
      queryBuilder.andWhere('teacher.id IN (:...teacherIds)', { teacherIds });
    }

    if (JSON.parse(pagination || 'true')) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const [data, total] = await queryBuilder
      .orderBy('class.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(
    id: number,
    user?: User,
    relations = ['major', 'teachers', 'users'],
  ): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations,
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async findByIds(ids: number[]): Promise<Class[]> {
    const classes = await this.classRepository.findByIds(ids);
    if (!classes || classes.length === 0) {
      throw new NotFoundException(
        `Classes with IDS ${ids.toString()} not found`,
      );
    }
    return classes;
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const { name, majorId, teacherCodes, duration } = updateClassDto;

    const classEntity = await this.findOne(id);
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    if (name) classEntity.name = name;
    if (duration) classEntity.duration = duration;

    if (majorId) {
      const major = await this.majorService.findOne(majorId);
      if (!major) {
        throw new NotFoundException(`Major with ID ${majorId} not found`);
      }
      classEntity.major = major;
    }

    if (teacherCodes) {
      const teachers = await this.userService.findOrCreateUsersByCodes(
        teacherCodes,
        UserType.TEACHER,
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
      teacherCodes,
      UserType.TEACHER,
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
      userCodes,
      UserType.STUDENT,
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
    // Tìm class theo ID, bao gồm cả mối quan hệ với 'users'
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['users'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Tìm hoặc tạo người dùng theo danh sách mã (codes)
    const users = await this.userService.findOrCreateUsersByCodes(
      importUsersDto.users,
      UserType.STUDENT,
    );

    // Lọc ra những người dùng chưa có trong classEntity.users
    const newUsers = users.filter(
      (user) =>
        !classEntity.users.some((existingUser) => existingUser.id === user.id),
    );

    // Thêm những người dùng mới vào classEntity.users
    classEntity.users = [...classEntity.users, ...newUsers];

    // Lưu lại thay đổi
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
      UserType.TEACHER,
    );

    classEntity.teachers = [...classEntity.teachers, ...teachers];

    return this.classRepository.save(classEntity);
  }

  async deleteTeacherToClass(
    classId: number,
    teacherCode: string,
  ): Promise<Class> {
    const classEntity = await this.findOne(classId);
    const teacherCodes = classEntity.teachers.map((teacher) => teacher.code);
    if (!teacherCodes.includes(teacherCode)) {
      throw new NotFoundException(
        `Teacher with code ${teacherCode} not found in class with ID ${classId}`,
      );
    }
    classEntity.teachers = classEntity.teachers.filter(
      (teacher) => teacher.code !== teacherCode,
    );
    return await this.classRepository.save(classEntity);
  }

  async addStudentToClass(
    dto: AddStudentDto,
    classId: number,
    user: User,
  ): Promise<Class> {
    await this.checkExistedUser(classId, user.id);

    const classEntity = await this.findOne(classId);
    const users = await this.userService.findOrCreateUsersByCodes(
      [dto],
      UserType.STUDENT,
    );
    classEntity.users.push(users[0]);
    return await this.classRepository.save(classEntity);
  }

  async deleteStudentFromClass(
    classId: number,
    studentCode: string,
    user: User,
  ) {
    await this.checkExistedTeacher(classId, user.id);
    const classEntity = await this.findOne(classId);
    classEntity.users = classEntity.users.filter(
      (item) => item.code !== studentCode,
    );
    return await this.classRepository.save(classEntity);
  }

  async checkExistedUser(classId: number, userId: number) {
    const classExist = await this.findOne(classId);

    // Kiểm tra xem userId có nằm trong danh sách người dùng của lớp không
    const userExists = classExist.users.some((user) => user.id === userId);

    return userExists; // Trả về true nếu người dùng tồn tại, ngược lại false
  }

  async checkExistedTeacher(classId: number, userId: number) {
    const classExist = await this.findOne(classId);

    // Kiểm tra xem userId có nằm trong danh sách người dùng của lớp không
    const userExists = classExist.teachers.some((user) => user.id === userId);

    if (!userExists) {
      throw new NotFoundException(
        `User with ID ${userId} not found in class with ID ${classId}`,
      );
    }

    return userExists; // Trả về true nếu người dùng tồn tại, ngở false
  }

  async getStudentFromClass(classId: number, user: User) {
    const classEntity = await this.findOne(classId, user);
    return { data: classEntity.users };
  }

  async findMe(user: User) {
    const queryBuilder = await this.classRepository.createQueryBuilder('class');
    queryBuilder.leftJoin('class.users', 'users');
    queryBuilder
      .leftJoin('class.major', 'major')
      .addSelect(['major.name', 'major.code']);
    queryBuilder.where('users.id = :userId', { userId: user.id });
    const data = await queryBuilder.getMany();
    return { data };
  }

  async joinClass(secretKey: string, user: User) {
    const classEntity = await this.classRepository.findOne({
      where: { secretKey },
      relations: ['users'],
    });
    if (!classEntity) {
      throw new NotFoundException(
        `Class with secret key ${secretKey} not found`,
      );
    }

    if (classEntity.users.some((item) => item.id === user.id)) {
      throw new BadRequestException('User already in class');
    }

    classEntity.users.push(user);
    await this.classRepository.save(classEntity);
    return { data: true };
  }
}
