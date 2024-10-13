import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Letter } from './letter.entity';
import {
  CreateLetterDto,
  UpdateLetterStatusDto,
  QueryLetterDto,
  LetterStatus,
} from './letter.dto';
import { ClassService } from '../class/class.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { UserType } from '../user/user.dto';

@Injectable()
export class LetterService {
  constructor(
    @InjectRepository(Letter)
    private readonly letterRepository: Repository<Letter>,
    private readonly classService: ClassService,
    private readonly userService: UserService,
  ) {}

  // Tạo một đơn
  async create(
    createLetterDto: CreateLetterDto,
    userId: number,
  ): Promise<Letter> {
    const { type, reason, classId } = createLetterDto;
    const classEntity = await this.classService.findOne(classId);
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    const user = await this.userService.findOne(userId);

    const letter = this.letterRepository.create({
      type,
      reason,
      status: LetterStatus.PENDING,
      user,
      class: classEntity,
    });

    return this.letterRepository.save(letter);
  }

  // Cập nhật trạng thái đơn
  async updateStatus(
    id: number,
    updateLetterStatusDto: UpdateLetterStatusDto,
  ): Promise<Letter> {
    const letter = await this.findOne(id);
    letter.status = updateLetterStatusDto.status;
    return this.letterRepository.save(letter);
  }

  // Lấy tất cả đơn với phân trang và bộ lọc theo trạng thái, lớp, người tạo, ngày tạo và ngày duyệt
  async findAll(
    query: QueryLetterDto,
    user: User,
  ): Promise<{ data: Letter[]; total: number }> {
    const {
      status,
      classId,
      createdAt,
      approvedAt,
      page = 1,
      limit = 10,
      pagination,
    } = query;

    const queryBuilder = this.letterRepository
      .createQueryBuilder('letter')
      .leftJoinAndSelect('letter.class', 'class')
      .leftJoinAndSelect('letter.user', 'user');

    if (status) {
      queryBuilder.andWhere('letter.status = :status', { status });
    }

    if (classId) {
      queryBuilder.andWhere('letter.class.id = :classId', { classId });
    }

    if (user.type !== UserType.MASTER) {
      queryBuilder.andWhere('letter.user.id = :userId', { userId: user.id });
    }

    if (createdAt) {
      queryBuilder.andWhere('letter.createdAt = :createdAt', { createdAt });
    }

    if (approvedAt) {
      queryBuilder.andWhere(
        'letter.updatedAt = :approvedAt AND letter.status = :status',
        {
          approvedAt,
          status: LetterStatus.APPROVED,
        },
      );
    }
    if (pagination) {
      queryBuilder
        .skip((page - 1) * limit) // Phân trang
        .take(limit);
    }

    const [data, total] = await queryBuilder

      .orderBy('letter.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  // Lấy đơn theo teacherId với phân trang và bộ lọc theo trạng thái, lớp, người tạo, ngày tạo và ngày duyệt
  async findLettersByTeacher(
    teacherId: number,
    query: QueryLetterDto,
  ): Promise<{ data: Letter[]; total: number }> {
    const {
      status,
      classId,
      userId,
      createdAt,
      approvedAt,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.letterRepository
      .createQueryBuilder('letter')
      .leftJoinAndSelect('letter.class', 'class')
      .leftJoin('class.teachers', 'teacher')
      .where('teacher.id = :teacherId', { teacherId });

    if (status) {
      queryBuilder.andWhere('letter.status = :status', { status });
    }

    if (classId) {
      queryBuilder.andWhere('letter.class.id = :classId', { classId });
    }

    if (userId) {
      queryBuilder.andWhere('letter.user.id = :userId', { userId });
    }

    if (createdAt) {
      queryBuilder.andWhere('letter.createdAt = :createdAt', { createdAt });
    }

    if (approvedAt) {
      queryBuilder.andWhere(
        'letter.updatedAt = :approvedAt AND letter.status = :status',
        {
          approvedAt,
          status: LetterStatus.APPROVED,
        },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit) // Phân trang
      .take(limit)
      .orderBy('letter.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Letter> {
    const letter = await this.letterRepository.findOne({
      where: { id },
      relations: ['class', 'user'], // Liên kết với class và user để lấy đủ thông tin
    });

    if (!letter) {
      throw new NotFoundException(`Letter with ID ${id} not found`);
    }

    return letter;
  }

  async findMyLetters(
    userId: number,
    query: QueryLetterDto,
  ): Promise<{ data: Letter[]; total: number }> {
    const {
      status,
      classId,
      createdAt,
      approvedAt,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.letterRepository
      .createQueryBuilder('letter')
      .leftJoinAndSelect('letter.class', 'class')
      .where('letter.user.id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('letter.status = :status', { status });
    }

    if (classId) {
      queryBuilder.andWhere('letter.class.id = :classId', { classId });
    }

    if (createdAt) {
      queryBuilder.andWhere('letter.createdAt = :createdAt', { createdAt });
    }

    if (approvedAt) {
      queryBuilder.andWhere(
        'letter.updatedAt = :approvedAt AND letter.status = :status',
        {
          approvedAt,
          status: LetterStatus.APPROVED,
        },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('letter.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }
}
