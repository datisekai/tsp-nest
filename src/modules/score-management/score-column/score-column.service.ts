import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassService } from 'src/modules/class/class.service';
import { MajorService } from 'src/modules/major/major.service';
import { In, Repository } from 'typeorm';
import {
  CreateMultipleScoreColumnsDto,
  CreateScoreColumnMajorDto,
} from './score-column.dto';
import { ScoreColumn } from './score-column.entity';

@Injectable()
export class ScoreColumnService {
  constructor(
    @InjectRepository(ScoreColumn)
    private scoreColumnRepository: Repository<ScoreColumn>,
    private classService: ClassService,
    private majorService: MajorService,
  ) {}

  async findByMajorId(majorId: number) {
    const major = await this.majorService.findOne(majorId);
    const classIds = major.classes.map((classEntity) => classEntity.id);
    const columns = await this.scoreColumnRepository.find({
      where: { class: { id: In(classIds) } },
    });

    return { data: { major, columns } };
  }

  async findByClassId(classId: number) {
    const columns = await this.scoreColumnRepository.find({
      where: { class: { id: classId } },
    });

    return { data: columns };
  }

  async updateMultiple(dto: CreateScoreColumnMajorDto) {
    await Promise.allSettled(dto.scoreColumns.map((item) => this.update(item)));
    return true;
  }

  async update(
    createMultipleScoreColumnsDto: CreateMultipleScoreColumnsDto,
  ): Promise<ScoreColumn[]> {
    const { classId, scoreColumns } = createMultipleScoreColumnsDto;

    const classEntity = await this.classService.findOne(classId);
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Tạo một mảng để lưu các cột điểm đã tạo và cập nhật
    const updatedScoreColumns: ScoreColumn[] = [];

    for (const createScoreColumnDto of scoreColumns) {
      if (createScoreColumnDto.id) {
        // Nếu có ID, cập nhật cột điểm
        const existingColumn = await this.findOne(createScoreColumnDto.id);
        if (!existingColumn) {
          throw new NotFoundException(
            `ScoreColumn with ID ${createScoreColumnDto.id} not found`,
          );
        }

        // Cập nhật thông tin cho cột điểm
        Object.assign(existingColumn, createScoreColumnDto);
        updatedScoreColumns.push(existingColumn);
      } else {
        // Nếu không có ID, tạo cột điểm mới
        const newScoreColumn = this.scoreColumnRepository.create({
          ...createScoreColumnDto,
          class: classEntity,
        });

        updatedScoreColumns.push(newScoreColumn);
      }
    }

    // Lưu tất cả cột điểm (cả mới và đã cập nhật)
    return this.scoreColumnRepository.save(updatedScoreColumns);
  }

  async findOne(id: number): Promise<ScoreColumn> {
    const classEntity = await this.scoreColumnRepository.findOne({
      where: { id },
      relations: ['class'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async deleteScoreColumn(id: number) {
    const scoreColumn = await this.findOne(id);
    return await this.scoreColumnRepository.remove(scoreColumn);
  }
}
