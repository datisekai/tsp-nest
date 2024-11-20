import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateFacultyDto,
  UpdateFacultyDto,
  QueryFacultyDto,
  CreateFacultyMultipleDto,
} from './faculty.dto';
import { Faculty } from './faculty.entity';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async findAll(
    queryDto: QueryFacultyDto,
  ): Promise<{ data: Faculty[]; total: number }> {
    const { name, page = 1, limit = 10, pagination } = queryDto;

    const queryBuilder = this.facultyRepository.createQueryBuilder('faculty');

    // Add filter by name if provided
    if (name) {
      queryBuilder.where('faculty.name LIKE :name', { name: `%${name}%` });
    }

    // Apply pagination
    if (JSON.parse(pagination || 'true')) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }
    queryBuilder.orderBy('faculty.createdAt', 'DESC');

    // Execute the query and get results with total count
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }
    return faculty;
  }

  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    const faculty = this.facultyRepository.create(createFacultyDto);
    return this.facultyRepository.save(faculty);
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    const faculty = await this.findOne(id);
    Object.assign(faculty, updateFacultyDto);
    return this.facultyRepository.save(faculty);
  }

  async delete(id: number): Promise<Faculty> {
    const faculty = await this.findOne(id);
    return await this.facultyRepository.remove(faculty);
  }

  async findByCode(code: string): Promise<Faculty> {
    return await this.facultyRepository.findOne({ where: { code } });
  }

  async createMultipleFaculty(
    dto: CreateFacultyMultipleDto,
  ): Promise<Faculty[]> {
    const { faculties } = dto;
    const newFaculties = [];
    faculties.forEach((item) => {
      const newFaculty = this.facultyRepository.create(item);
      newFaculties.push(newFaculty);
    });

    return await this.facultyRepository.save(newFaculties);
  }
}
