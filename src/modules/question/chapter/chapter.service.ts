import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { Repository } from 'typeorm';
import { CreateChapterDto, QueryChapterDto } from '../question.dto';
import { User } from 'src/modules/user/user.entity';
import { checkUserPermission } from 'src/common/helpers/checkPermission';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
  ) {}

  async createChapter(
    createChapterDto: CreateChapterDto,
    user: User,
  ): Promise<Chapter> {
    const { name, majorId } = createChapterDto;
    const chapter = this.chapterRepository.create({
      name,
      major: { id: majorId },
      user,
    });
    delete chapter['user'];
    return await this.chapterRepository.save(chapter);
  }

  async deleteChapter(id: number, user: User): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id },
    });
    checkUserPermission(chapter.user.id, user);
    return await this.chapterRepository.remove(chapter);
  }

  async getAll(
    dto: QueryChapterDto,
  ): Promise<{ data: Chapter[]; total: number }> {
    const { majorId, page = 1, limit = 10, pagination } = dto;
    const query = this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoin('chapter.major', 'major')
      .addSelect(['major.name', 'major.code']);

    if (majorId) {
      query.andWhere('chapter.major.id LIKE :majorId', { majorId });
    }

    if (JSON.parse(pagination || 'true')) {
      query.skip((page - 1) * limit).take(limit);
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }
}
