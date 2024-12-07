import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './question.entity';
import {
  CreateUpdateQuestionDto,
  QueryGenerateQuestionDto,
  QueryQuestionDto,
} from './question.dto';
import { Brackets, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserType } from '../user/user.dto';
import { TestCase } from './testcase/testcase.entity';
import { Difficulty } from './difficulty/difficulty.entity';
import { Chapter } from './chapter/chapter.entity';
import { checkUserPermission } from 'src/common/helpers/checkPermission';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(TestCase)
    private testCaseRepository: Repository<TestCase>,
  ) {}

  async getAll(
    dto: QueryQuestionDto,
    user: User,
  ): Promise<{ data: Question[]; total: number }> {
    const {
      title,
      page = 1,
      limit = 10,
      pagination,
      type = 'all',
      difficultyId,
      chapterId,
      questionType,
      majorId,
      isPublic,
    } = dto;

    const query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.difficulty', 'difficulty')
      .leftJoinAndSelect('question.chapter', 'chapter')
      .where('question.isDeleted = false')
      .leftJoin('question.user', 'user')
      .leftJoin('question.major', 'major')
      .leftJoin('major.teachers', 'teacher')
      .addSelect(['user.id']);

    if (difficultyId) {
      query.andWhere('difficulty.id = :difficultyId', {
        difficultyId,
      });
    }

    if (chapterId) {
      query.andWhere('chapter.id = :chapterId', { chapterId });
    }

    if (majorId) {
      query.andWhere('major.id = :majorId', { majorId });
    }

    if (questionType) {
      query.andWhere('question.type like :questionType', {
        questionType: `%${questionType}%`,
      });
    }

    if (isPublic != null) {
      query.andWhere('question.isPublic = :isPublic', { isPublic });
    }

    if (title) {
      query.andWhere('question.title LIKE :title', { title: `%${title}%` });
    }
    if (JSON.parse(pagination || 'true')) {
      query.skip((page - 1) * limit).take(limit);
    }

    if (type === 'me') {
      query.andWhere('question.user.id = :userId', { userId: user.id });
    }

    if (user.type !== UserType.MASTER && type === 'all') {
      query.andWhere('teacher.id = :teacherId', { teacherId: user.id });
      query.andWhere(
        new Brackets((qb) => {
          qb.where('question.user.id = :userId', { userId: user.id }).orWhere(
            'question.isPublic = true',
          );
        }),
      );
    }
    query.addOrderBy('question.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async createQuestion(
    createQuestionDto: CreateUpdateQuestionDto,
    user: User,
  ): Promise<Question> {
    const {
      title,
      content,
      type,
      isPublic,
      difficultyId,
      chapterId,
      choices,
      testCases,
      acceptedLanguages,
      initCode,
      majorId,
    } = createQuestionDto;

    const question = this.questionRepository.create({
      title,
      content,
      type,
      isPublic,
      difficulty: { id: difficultyId } as Difficulty,
      chapter: { id: chapterId } as Chapter,
      major: { id: majorId },
      user: { id: user.id },
      choices,
      acceptedLanguages,
      initCode,
    });

    const savedQuestion = await this.questionRepository.save(question);

    // Tạo test cases nếu có
    if (testCases) {
      const testCaseEntities = testCases.map((testCase) =>
        this.testCaseRepository.create({
          ...testCase,
          question: savedQuestion,
        }),
      );
      await this.testCaseRepository.save(testCaseEntities);
    }

    return savedQuestion;
  }

  async getQuestionById(id: number, user?: User): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['difficulty', 'chapter', 'user', 'testCases', 'major'],
    });
    if (user) {
      console.log('getQuestionById', question.user, user);
      checkUserPermission(question.user.id, user);
    }
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async updateQuestion(
    id: number,
    updateQuestionDto: CreateUpdateQuestionDto,
    user: User,
  ): Promise<Question> {
    console.log('called 1');
    const question = await this.getQuestionById(id, user);

    Object.assign(question, updateQuestionDto);

    const updatedQuestion = await this.questionRepository.save(question);

    if (updateQuestionDto.testCases) {
      await this.testCaseRepository.delete({ question: { id } });
      const testCaseEntities = updateQuestionDto.testCases.map((testCase) =>
        this.testCaseRepository.create({
          ...testCase,
          question: updatedQuestion,
        }),
      );
      await this.testCaseRepository.save(testCaseEntities);
    }

    return updatedQuestion;
  }

  async deleteQuestion(id: number, user: User): Promise<Question> {
    const question = await this.getQuestionById(id, user);
    question.isDeleted = true;
    return await this.questionRepository.save(question);
  }

  async generateQuestion(dto: QueryGenerateQuestionDto, user: User) {
    const { chapterId, count, difficultyId } = dto;
    const queryBuilder = this.questionRepository.createQueryBuilder('question');
    queryBuilder
      .leftJoin('question.difficulty', 'difficulty')
      .addSelect(['difficulty.id', 'difficulty.level'])
      .leftJoin('question.chapter', 'chapter')
      .addSelect(['chapter.id', 'chapter.name'])
      .where('chapter.id = :chapterId', { chapterId })
      .andWhere('difficulty.id = :difficultyId', { difficultyId })
      .andWhere('question.isDeleted = false')
      .limit(+count)
      .orderBy('RAND()');

    if (user.type !== UserType.MASTER) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('question.user.id = :userId', { userId: user.id }).orWhere(
            'question.isPublic = true',
          );
        }),
      );
    }

    const data = await queryBuilder.getMany();
    return { data };
  }
}
