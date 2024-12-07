import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

  // Tạo một đơn
  async create(
    createLetterDto: CreateLetterDto,
    userId: number,
  ): Promise<Letter> {
    const { type, reason, classId, image, time } = createLetterDto;

    const letter = this.letterRepository.create({
      type,
      reason,
      status: LetterStatus.PENDING,
      user: { id: userId },
      class: { id: classId },
      image,
      time,
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
      .leftJoin('letter.class', 'class')
      .addSelect(['class.name'])
      .leftJoin('class.teachers', 'teacher')
      .leftJoin('class.major', 'major')
      .addSelect(['major.code', 'major.name'])
      .leftJoin('letter.user', 'user')
      .addSelect(['user.code', 'user.name']);

    if (status) {
      queryBuilder.andWhere('letter.status = :status', { status });
    }

    if (classId) {
      queryBuilder.andWhere('letter.class.id = :classId', { classId });
    }

    if (user.type == UserType.TEACHER) {
      queryBuilder.andWhere('teacher.id = :userId', { userId: user.id });
    }

    if (user.type === UserType.STUDENT) {
      queryBuilder.andWhere('user.id = :userId', { userId: user.id });
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
    if (JSON.parse(pagination || 'true')) {
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

  async delete(id: number, user: User): Promise<Letter> {
    const letter = await this.findOne(id);

    if (letter.user.id !== user.id) {
      throw new ForbiddenException(
        "You don't have permission to delete this letter",
      );
    }

    return await this.letterRepository.remove(letter);
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
      .leftJoinAndSelect('class.major', 'major')
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

  getPendingLettersCount(userId: number) {
    return this.letterRepository
      .createQueryBuilder('letter')
      .leftJoin('letter.class', 'class')
      .leftJoin('class.teachers', 'teacher')
      .where('teacher.id = :userId', { userId })
      .andWhere('letter.status = :status', { status: 'pending' })
      .getCount();
  }

  getPendingLetters(userId: number) {
    return this.letterRepository
      .createQueryBuilder('letter')
      .leftJoin('letter.class', 'class')
      .leftJoin('class.major', 'major')
      .leftJoin('letter.user', 'user')
      .addSelect(['user.code', 'user.name'])
      .addSelect(['class.name', 'major.name', 'major.code'])
      .leftJoin('class.teachers', 'teacher')
      .addSelect(['teacher.code', 'teacher.name'])
      .where('teacher.id = :userId', { userId })
      .orderBy('letter.createdAt', 'DESC')
      .limit(10)
      .getMany();
  }
}
