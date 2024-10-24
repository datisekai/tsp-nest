import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import {
  CreateAttendanceDto,
  CreateAttendeeDto,
  QueryAttendanceDto,
  QueryAttendeeDto,
  UpdateAttendanceDto,
} from './attendance.dto';
import { Attendee } from './attendee.entity';
import { removeVietnameseDiacritics } from 'src/common/helpers';
import { User } from '../user/user.entity';
import { UserType } from '../user/user.dto';
import { checkUserPermission } from 'src/common/helpers/checkPermission';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
    userId: number,
  ): Promise<Attendance> {
    const secretKey = Math.random().toString(36).substring(2);
    const attendance = this.attendanceRepository.create({
      ...createAttendanceDto,
      user: { id: userId },
      secretKey,
      class: { id: createAttendanceDto.classId },
    });
    return await this.attendanceRepository.save(attendance);
  }

  async findAttendeeMe(
    dto: QueryAttendeeDto,
    userId: number,
  ): Promise<{ data: Attendee[]; total: number }> {
    const { limit = 10, page = 1, from, to, majorCode, majorName } = dto;
    const query = this.attendeeRepository
      .createQueryBuilder('attendee')
      .leftJoinAndSelect('attendee.attendance', 'attendance')
      .leftJoinAndSelect('attendance.class', 'class')
      .leftJoinAndSelect('class.major', 'major')
      .leftJoinAndSelect('class.teachers', 'teachers')
      .orderBy('attendee.createdAt', 'DESC')
      .where('attendee.user.id = :userId', { userId })
      .andWhere('attendee.isSuccess = :isSuccess', { isSuccess: true })
      .select([
        'attendee.id',
        'attendee.createdAt',
        'attendance.createdAt',
        'class.name',
        'major.code',
        'major.name',
        'teachers.name',
        'teachers.code',
      ])
      .limit(limit)
      .offset((page - 1) * limit);

    if (majorCode) {
      query.andWhere('major.code = :majorCode', { majorCode });
    }

    if (majorName) {
      const normalizedMajorName =
        removeVietnameseDiacritics(majorName).toLowerCase();
      query.andWhere('LOWER(major.name) LIKE :majorName', {
        majorName: `%${normalizedMajorName}%`,
      });
    }

    if (from) {
      query.andWhere('attendee.createdAt >= :from', { from: new Date(from) });
    }

    if (to) {
      query.andWhere('attendee.createdAt <= :to', { to: new Date(to) });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
  // Lấy danh sách Attendance với phân trang và lọc theo createdAt
  async findAll(
    dto: QueryAttendanceDto,
    user: User,
  ): Promise<{ data: Attendance[]; total: number }> {
    const { title, isOpen, classId, limit = 10, page = 1, pagination } = dto;
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.createdAt',
        'attendance.updatedAt',
        'attendance.isOpen',
        'attendance.title',
        'attendance.secretKey',
        'attendance.expirationTime',
        'class.id',
        'class.name',
        'major.code',
        'major.id',
        'major.name',
        'user.code',
        'user.name',
        'teachers.code',
        'teachers.name',
        'attendees.createdAt',
        'attendee_user.name',
        'attendee_user.code',
      ])
      .leftJoin('attendance.class', 'class')
      .leftJoin('class.major', 'major')
      .leftJoin('class.teachers', 'teachers')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.attendees', 'attendees')
      .leftJoin('attendees.user', 'attendee_user')
      .orderBy('attendance.createdAt', 'DESC'); // Sắp xếp theo createdAt (mới nhất trước)

    // Kiểm tra các điều kiện lọc
    if (title) {
      query.andWhere('attendance.title LIKE :title', { title: `%${title}%` });
    }

    if (isOpen !== undefined) {
      query.andWhere('attendance.isOpen = :isOpen', { isOpen });
    }

    if (classId) {
      query.andWhere('attendance.classId = :classId', { classId });
    }

    if (user.type !== UserType.MASTER) {
      query.andWhere('attendance.user.id = :userId', { userId: user.id });
    }

    if (pagination) {
      query
        .skip((page - 1) * limit) // Bỏ qua các bản ghi trước đó
        .take(limit); // Giới hạn số lượng bản ghi trên mỗi trang
    }

    // Phân trang
    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }
  async findOne(id: number, user?: User): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['user', 'class'],
    });
    if (user) {
      checkUserPermission(attendance.user.id, user);
    }
    if (!attendance) {
      throw new NotFoundException(`Attendance với ID ${id} không tồn tại`);
    }
    return attendance;
  }

  async findAttendees(id: number): Promise<{ data: Attendee[] }> {
    const query = this.attendeeRepository
      .createQueryBuilder('attendee')
      .select([
        'attendee.id',
        'attendee.createdAt',
        'attendee.isSuccess',
        'user.code',
        'user.name',
        'user.email',
        'user.phone',
      ])
      .where('attendee.attendanceId = :id', { id })
      .leftJoin('attendee.user', 'user');
    const data = await query.getMany();
    return { data };
  }

  async addAttendee(createAttendeeDto: CreateAttendeeDto): Promise<Attendee> {
    const { isSuccess, attendanceId, userId } = createAttendeeDto;

    const newAttendee = this.attendeeRepository.create({
      isSuccess,
      attendance: { id: attendanceId },
      user: { id: userId },
    });

    return await this.attendeeRepository.save(newAttendee);
  }
  // Cập nhật Attendance theo ID
  async update(
    id: number,
    updateAttendanceDto: UpdateAttendanceDto,
    user?: User,
  ): Promise<Attendance> {
    const attendance = await this.findOne(id, user);
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  // Xóa Attendance theo ID
  async remove(id: number, user: User): Promise<Attendance> {
    const attendance = await this.findOne(id, user);
    return await this.attendanceRepository.remove(attendance);
  }
}
