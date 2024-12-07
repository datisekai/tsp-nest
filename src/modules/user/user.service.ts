import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserDto,
  QueryTeacherDto,
  QueryUserDto,
  SearchUserDto,
  UpdateUserDto,
  UserType,
} from './user.dto';
import { User } from './user.entity';
import { removeVietnameseDiacritics } from 'src/common/helpers';
import { LetterService } from '../letter/letter.service';
import { ClassService } from '../class/class.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly letterService: LetterService,
    @Inject(forwardRef(() => ClassService)) // Dùng forwardRef ở đây
    private readonly classService: ClassService,
  ) {}

  async findAll(
    queryDto: QueryUserDto,
  ): Promise<{ data: User[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      code,
      deviceUid,
      email,
      name,
      phone,
      type, // Thêm điều kiện lọc theo type (teacher/student)
      pagination,
    } = queryDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Add filters dynamically
    if (code) {
      queryBuilder.andWhere('user.code LIKE :code', { code: `%${code}%` });
    }

    if (deviceUid) {
      queryBuilder.andWhere('user.deviceUid LIKE :deviceUid', {
        deviceUid: `%${deviceUid}%`,
      });
    }

    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    if (name) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${name}%` });
    }

    if (phone) {
      queryBuilder.andWhere('user.phone LIKE :phone', { phone: `%${phone}%` });
    }

    // Lọc theo type (teacher/student)
    if (type) {
      queryBuilder.andWhere('user.type = :type', { type });
    }

    // Paginate results
    if (JSON.parse(pagination || 'true')) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Execute the query and get the data and total count
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findTeachers(dto: QueryTeacherDto): Promise<{ data: User[] }> {
    const { code, name } = dto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (code) {
      queryBuilder.andWhere('user.code LIKE :code', { code: `%${code}%` });
    }

    if (name) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${name}%` });
    }

    queryBuilder.andWhere(
      '(user.type = :teacherType OR user.type = :unknownType)',
      {
        teacherType: UserType.TEACHER,
        unknownType: UserType.UNKNOWN,
      },
    );
    queryBuilder.andWhere('user.type != :type', { type: UserType.STUDENT });
    queryBuilder.select([
      'user.id',
      'user.code',
      'user.name',
      'user.avatar',
      'user.email',
    ]);

    queryBuilder.orderBy('user.createdAt', 'DESC');

    const data = await queryBuilder.getMany();

    return { data };
  }

  async findOne(id: number, relations = [], is401 = false): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: relations,
    });
    if (!user) {
      if (is401)
        throw new UnauthorizedException(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByIds(ids: number[]): Promise<User[]> {
    const users = await this.userRepository.findByIds(ids);
    if (!users) {
      throw new NotFoundException(`User with IDS ${ids.toString()} not found`);
    }
    return users;
  }

  async findByCode(code: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { code },
      select: ['id', 'active', 'code', 'email', 'password', 'type'],
    });

    return user;
  }

  async findOrCreateUsersByCodes(
    userData: any,
    userType?: UserType,
  ): Promise<User[]> {
    const codes = userData.map((user) => user.code); // Lấy tất cả codes từ mảng userData
    const existingUsers = await this.findByCodes(codes); // Tìm người dùng hiện có
    const existingUserCodes = new Set(existingUsers.map((user) => user.code));

    // Lọc những codes không tồn tại
    const newUsersData = userData.filter(
      (user) => !existingUserCodes.has(user.code.toString()),
    );

    // Tạo người dùng mới với name và code
    const newUsers = await Promise.all(
      newUsersData.map(async (user) => {
        return this.create({
          ...user,
          code: user.code,
          name: user.name || 'Unknown', // Nếu không có name, dùng tên mặc định
          password: null, // Mật khẩu null
          email: ``, // Email giả định
          type: userType || UserType.UNKNOWN,
        });
      }),
    );

    return [...existingUsers, ...newUsers];
  }

  // Tìm người dùng dựa trên codes
  async findByCodes(codes: string[]): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.code IN (:...codes)', { codes })
      .getMany();
  }

  async findByCodeAndCheckClass(
    userCode: string,
    classId: number,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { code: userCode },
      relations: ['classes'], // Load cả danh sách classes của user
    });

    if (!user) {
      return null; // Không tìm thấy user
    }

    // Kiểm tra user có thuộc class với id classId hay không
    const isInClass = user.classes.some(
      (classEntity) => classEntity.id === classId,
    );

    return isInClass ? user : null;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      fullTextSearch: `${removeVietnameseDiacritics(`${createUserDto.code}`)} ${removeVietnameseDiacritics(`${createUserDto.name}`)}`,
      role: createUserDto?.roleId ? { id: createUserDto.roleId } : null,
    });

    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<User> {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  async resetDevice(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.deviceUid = null;
    return this.userRepository.save(user);
  }

  async findClass(id: number) {
    const user = await this.findOne(id, ['classes', 'classes.major']);
    return { data: user.classes };
  }

  async searchUser(
    queryDto: SearchUserDto,
  ): Promise<{ data: User[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      q = '',
      type, // Thêm điều kiện lọc theo type (teacher/student)
      pagination,
    } = queryDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select(['user.code', 'user.name', 'user.avatar']);

    if (q) {
      queryBuilder.andWhere('fullTextSearch LIKE :keyword', {
        keyword: `%${q}%`,
      });
    }

    // Lọc theo type (teacher/student)
    if (type) {
      queryBuilder.andWhere('user.type = :type', { type });
    }

    // Paginate results
    if (JSON.parse(pagination || 'true')) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Execute the query and get the data and total count
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  // async updateAll() {
  //   const users = await this.userRepository.find();

  //   for (const user of users) {
  //     user.fullTextSearch = `${removeVietnameseDiacritics(user.code)} ${removeVietnameseDiacritics(user.name)}`;
  //     // Cập nhật lại để trigger @BeforeUpdate
  //     await this.userRepository.save(user);
  //   }
  // }
  async statistic(user: User) {
    const teachingClassesCount = await this.classService.getCountMyClass(user);

    // 2. Số bài kiểm tra đang mở
    const openExamsCount = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.exams', 'exam')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('exam.endTime > NOW()')
      .getCount();

    const pendingLettersCount = await this.letterService.getPendingLettersCount(
      user.id,
    );

    const pendingLetters = await this.letterService.getPendingLetters(user.id);

    return {
      data: {
        teachingClassesCount,
        openExamsCount,
        pendingLettersCount,
        pendingLetters,
      },
    };
  }
}
