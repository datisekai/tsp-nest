import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import {
  CreateAttendanceDto,
  CreateAttendeeDto,
  QueryAttendanceDto,
  UpdateAttendanceDto,
} from './attendance.dto';
import { Attendee } from './attendee.entity';

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
    });
    return await this.attendanceRepository.save(attendance);
  }
  // Lấy danh sách Attendance với phân trang và lọc theo createdAt
  async findAll(
    dto: QueryAttendanceDto,
    userId?: number,
  ): Promise<{ data: Attendance[]; total: number }> {
    const { title, isOpen, classId, limit, page } = dto;
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.class', 'class')
      .leftJoinAndSelect('attendance.user', 'user')
      .leftJoinAndSelect('attendance.attendees', 'attendees')
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

    if (userId) {
      query.andWhere('attendance.userId = :userId', { userId });
    }

    // Phân trang
    const [data, total] = await query
      .skip((page - 1) * limit) // Bỏ qua các bản ghi trước đó
      .take(limit) // Giới hạn số lượng bản ghi trên mỗi trang
      .getManyAndCount();

    return { data, total };
  }
  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance với ID ${id} không tồn tại`);
    }
    return attendance;
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
  ): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  // Xóa Attendance theo ID
  async remove(id: number): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }
}
