import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { CreateUpdateQuestionDto, QueryQuestionDto } from './question.dto';
import { Repository } from 'typeorm';
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
    const { title, isPublic, page = 1, limit = 10, pagination } = dto;
    const query = this.questionRepository.createQueryBuilder('question');

    if (title) {
      query.andWhere('question.title LIKE :title', { title: `%${title}%` });
    }

    if (typeof isPublic === 'boolean') {
      query.andWhere('question.isPublic = :isPublic', { isPublic });
    }

    if (pagination) {
      query.skip((page - 1) * limit).take(limit);
    }

    if (user.type !== UserType.MASTER) {
      query.andWhere('question.userId = :userId', { userId: user.id });
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async createQuestion(
    createQuestionDto: CreateUpdateQuestionDto,
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
    } = createQuestionDto;

    const question = this.questionRepository.create({
      title,
      content,
      type,
      isPublic,
      difficulty: { id: difficultyId } as Difficulty,
      chapter: { id: chapterId } as Chapter,
      choices,
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

  async getQuestionById(id: number, user: User): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['difficulty', 'chapter', 'user', 'testCases'],
    });
    checkUserPermission(question.user.id, user);
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
    return await this.questionRepository.remove(question);
  }
}
