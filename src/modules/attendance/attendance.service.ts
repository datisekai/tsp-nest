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

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }
  // Lấy danh sách Attendance với phân trang và lọc theo createdAt
  async findAll({
    createdAt,
    limit,
    page,
  }: QueryAttendanceDto): Promise<{ data: Attendance[]; total: number }> {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.class', 'class')
      .leftJoinAndSelect('attendance.user', 'user')
      .leftJoinAndSelect('attendance.attendees', 'attendees')
      .orderBy('attendance.createdAt', 'DESC'); // Sắp xếp theo createdAt (mới nhất trước)

    // Kiểm tra nếu có tham số lọc theo createdAt
    if (createdAt) {
      query.andWhere('attendance.createdAt >= :createdAt', { createdAt });
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
