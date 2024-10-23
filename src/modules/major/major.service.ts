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
import { User } from '../user/user.entity';
import { UserType } from '../user/user.dto';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
    private readonly facultyService: FacultyService,
    private readonly userService: UserService,
  ) {}

  async create(createMajorDto: CreateMajorDto): Promise<Major> {
    const { name, facultyId, teacherIds, code } = createMajorDto;

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
      code,
    });

    return this.majorRepository.save(major);
  }

  async findAll(
    queryMajorDto: QueryMajorDto,
    user: User,
  ): Promise<{ data: Major[]; total: number }> {
    const {
      name,
      facultyId,
      teacherIds,
      page = 1,
      limit = 10,
      code,
      pagination,
    } = queryMajorDto;

    // Tạo QueryBuilder cho Major
    const queryBuilder = this.majorRepository
      .createQueryBuilder('major')
      .leftJoinAndSelect('major.faculty', 'faculty')
      .leftJoinAndSelect('major.teachers', 'teacher');

    if (user.type !== UserType.MASTER) {
      queryBuilder.andWhere('teacher.id = :userId', { userId: user.id });
    }

    // Tìm kiếm theo tên nếu có
    if (name) {
      queryBuilder.andWhere('major.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('major.code LIKE :code', { code: `%${code}%` });
    }

    // Tìm kiếm theo facultyId nếu có
    if (facultyId) {
      queryBuilder.andWhere('major.faculty.id = :facultyId', { facultyId });
    }

    // Tìm kiếm theo danh sách teacherIds nếu có
    if (teacherIds && teacherIds.length > 0) {
      queryBuilder.andWhere('teacher.id IN (:...teacherIds)', { teacherIds });
    }

    if (pagination) {
      queryBuilder
        .skip((page - 1) * limit) // Offset
        .take(limit); // Limit số bản ghi mỗi lần
    }

    // Tính toán offset và limit cho phân trang
    const [data, total] = await queryBuilder

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
    const { name, facultyId, teacherIds, code } = updateMajorDto;

    const major = await this.majorRepository.findOne({ where: { id } });
    if (!major) {
      throw new NotFoundException(`Major with ID ${id} not found`);
    }

    if (name) major.name = name;
    if (code) major.code = code;
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

  async deleteTeacherToMajor(
    majorId: number,
    teacherCode: string,
  ): Promise<Major> {
    const major = await this.findOne(majorId);
    const teacherCodes = major.teachers.map((teacher) => teacher.code);
    if (!teacherCodes.includes(teacherCode)) {
      throw new NotFoundException(
        `Teacher with code ${teacherCode} not found in major with ID ${majorId}`,
      );
    }
    major.teachers = major.teachers.filter(
      (teacher) => teacher.code !== teacherCode,
    );
    return await this.majorRepository.save(major);
  }

  async assignTeacherToMajor(
    majorId: number,
    assignTeachersDto: AssignTeachersDto,
  ): Promise<Major> {
    const { teacherCodes } = assignTeachersDto;

    // Tìm major theo majorId
    const major = await this.majorRepository.findOne({
      where: { id: majorId },
      relations: ['teachers', 'faculty'],
    });
    if (!major) {
      throw new NotFoundException(`Major with ID ${majorId} not found`);
    }

    // Tìm giáo viên dựa trên teacherCodes
    const teachers = await this.userService.findOrCreateUsersByCodes(
      teacherCodes.map((code) => ({ code })),
      UserType.TEACHER,
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
