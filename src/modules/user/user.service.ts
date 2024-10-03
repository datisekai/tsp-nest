import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, QueryUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    queryBuilder.skip((page - 1) * limit).take(limit);
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Execute the query and get the data and total count
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: number, hasPermission = false): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: hasPermission ? ['role', 'role.permissions'] : [],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByCode(code: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { code },
      select: ['id', 'active', 'code', 'email', 'password', 'type'],
    });
    if (!user) {
      throw new NotFoundException(`User with Code ${code} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);

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
}
