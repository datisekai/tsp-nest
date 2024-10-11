import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Major } from './major.entity';
import { FacultyService } from '../faculty/faculty.service';
import { UserService } from '../user/user.service';
import {
  AssignTeachersDto,
  CreateMajorDto,
  QueryMajorDto,
  UpdateMajorDto,
} from './major.dto';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
    private readonly facultyService: FacultyService,
    private readonly userService: UserService,
  ) {}

  async create(createMajorDto: CreateMajorDto): Promise<Major> {
    const { name, facultyId, teacherIds } = createMajorDto;

    const faculty = await this.facultyService.findOne(facultyId);
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${facultyId} not found`);
    }

    const teachers = teacherIds
      ? await this.userService.findByIds(teacherIds)
      : [];

    const major = this.majorRepository.create({
      name,
      faculty,
      teachers,
    });

    return this.majorRepository.save(major);
  }

  async findAll(
    queryMajorDto: QueryMajorDto,
    userId?: number,
  ): Promise<{ data: Major[]; total: number }> {
    const { name, facultyId, teacherIds, page = 1, limit = 10 } = queryMajorDto;

    // Tạo QueryBuilder cho Major
    const queryBuilder = this.majorRepository
      .createQueryBuilder('major')
      .leftJoinAndSelect('major.faculty', 'faculty')
      .leftJoinAndSelect('major.teachers', 'teacher');

    if (userId) {
      queryBuilder.andWhere('teacher.id = :userId', { userId });
    }

    // Tìm kiếm theo tên nếu có
    if (name) {
      queryBuilder.andWhere('major.name LIKE :name', { name: `%${name}%` });
    }

    // Tìm kiếm theo facultyId nếu có
    if (facultyId) {
      queryBuilder.andWhere('major.faculty.id = :facultyId', { facultyId });
    }

    // Tìm kiếm theo danh sách teacherIds nếu có
    if (teacherIds && teacherIds.length > 0) {
      queryBuilder.andWhere('teacher.id IN (:...teacherIds)', { teacherIds });
    }

    // Tính toán offset và limit cho phân trang
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit) // Offset
      .take(limit) // Limit số bản ghi mỗi lần
      .orderBy('major.createdAt', 'DESC') // Sắp xếp theo thời gian tạo mới nhất
      .getManyAndCount(); // Trả về cả dữ liệu và tổng số bản ghi

    return { data, total };
  }

  async findOne(id: number): Promise<Major> {
    const major = await this.majorRepository.findOne({
      where: { id },
      relations: ['faculty', 'classes', 'teachers'],
    });
    if (!major) {
      throw new NotFoundException(`Major with ID ${id} not found`);
    }
    return major;
  }

  async update(id: number, updateMajorDto: UpdateMajorDto): Promise<Major> {
    const { name, facultyId, teacherIds } = updateMajorDto;

    const major = await this.majorRepository.findOne({ where: { id } });
    if (!major) {
      throw new NotFoundException(`Major with ID ${id} not found`);
    }

    if (name) major.name = name;
    if (facultyId) {
      const faculty = await this.facultyService.findOne(facultyId);
      if (!faculty) {
        throw new NotFoundException(`Faculty with ID ${facultyId} not found`);
      }
      major.faculty = faculty;
    }

    if (teacherIds) {
      const teachers = await this.userService.findByIds(teacherIds);
      major.teachers = teachers;
    }

    return this.majorRepository.save(major);
  }

  async delete(id: number): Promise<Major> {
    const major = await this.findOne(id);
    return await this.majorRepository.remove(major);
  }

  async assignTeacherToMajor(
    majorId: number,
    assignTeachersDto: AssignTeachersDto,
  ): Promise<Major> {
    const { teacherCodes } = assignTeachersDto;

    // Tìm major theo majorId
    const major = await this.majorRepository.findOne({
      where: { id: majorId },
      relations: ['teachers'],
    });
    if (!major) {
      throw new NotFoundException(`Major with ID ${majorId} not found`);
    }

    // Tìm giáo viên dựa trên teacherCodes
    const teachers = await this.userService.findOrCreateUsersByCodes(
      teacherCodes.map((code) => ({ code })),
    );
    if (teachers.length === 0) {
      throw new NotFoundException('No teachers found with the given codes');
    }

    // Thêm các giáo viên vào major mà không bị trùng
    const teacherSet = new Set(major.teachers.map((teacher) => teacher.id));
    teachers.forEach((teacher) => teacherSet.add(teacher.id));

    const uniqueTeachers = await this.userService.findByIds(
      Array.from(teacherSet),
    );

    major.teachers = uniqueTeachers;

    return this.majorRepository.save(major);
  }
}
