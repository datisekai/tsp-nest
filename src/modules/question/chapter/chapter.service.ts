import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { Repository } from 'typeorm';
import { CreateChapterDto } from '../question.dto';
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
    return await this.chapterRepository.save(chapter);
  }

  async deleteChapter(id: number, user: User): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id },
    });
    checkUserPermission(chapter.user.id, user);
    return await this.chapterRepository.remove(chapter);
  }

  async getAllChapters(): Promise<{ data: Chapter[] }> {
    const chapters = await this.chapterRepository.find();
    return { data: chapters };
  }

  async getAllChaptersOfMajor(majorId: number): Promise<{ data: Chapter[] }> {
    const chapters = await this.chapterRepository.find({
      where: { major: { id: majorId } },
    });
    return { data: chapters };
  }
}
