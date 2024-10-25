import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { CreateUpdateQuestionDto, QueryQuestionDto } from './question.dto';
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
    const { title, page = 1, limit = 10, pagination, type = 'all' } = dto;
    const query = this.questionRepository.createQueryBuilder('question');

    if (title) {
      query.andWhere('question.title LIKE :title', { title: `%${title}%` });
    }
    if (pagination) {
      query.skip((page - 1) * limit).take(limit);
    }

    if (type === 'me') {
      query.andWhere('question.user.id = :userId', { userId: user.id });
    }

    if (user.type !== UserType.MASTER && type === 'all') {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('question.user.id = :userId', { userId: user.id }).orWhere(
            'question.isPublic = true',
          );
        }),
      );
    }

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
      where: { id },
      relations: ['difficulty', 'chapter', 'user', 'testCases', 'major'],
    });
    if (user) {
      checkUserPermission(question.user.id, user);
    }
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async getQuestionByExamId(examId: number, user?: User): Promise<Question[]> {
    const questions = await this.questionRepository.find({
      where: { exams: { id: examId } },
    });

    questions.forEach((item) => {
      item.choices = item.choices.map((choice) => ({
        text: choice.text,
        isCorrect: undefined,
      }));
    });

    return questions;
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
