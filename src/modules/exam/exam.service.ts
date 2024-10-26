import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './exam.entity';
import { CreateExamDto, ExamQueryDto, UpdateExamDto } from './exam.dto';
import { QuestionService } from '../question/question.service';
import { User } from '../user/user.entity';
import { UserType } from '../user/user.dto';
import { checkUserPermission } from 'src/common/helpers/checkPermission';
import { ClassService } from '../class/class.service';

@Injectable()
export class ExamService {
  constructor(
    private readonly questionService: QuestionService,
    private readonly classService: ClassService,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {}

  async create(createExamDto: CreateExamDto, user: User): Promise<Exam> {
    const { classId, description, endTime, startTime, title, questions } =
      createExamDto;
    const exam = this.examRepository.create({
      title,
      description,
      endTime,
      startTime,
      questions: [],
      class: { id: classId },
      user: { id: user.id },
    });

    for (const questionId of questions) {
      const question = await this.questionService.getQuestionById(questionId);
      if (question) {
        exam.questions.push(question);
      }
    }
    return await this.examRepository.save(exam);
  }

  async findAll(
    query: ExamQueryDto,
    user: User,
  ): Promise<{ data: Exam[]; total: number }> {
    const {
      title,
      description,
      startTime,
      endTime,
      classId,
      page = 1,
      limit = 10,
      pagination = true,
    } = query;

    const queryBuilder = this.examRepository.createQueryBuilder('exam');

    // Áp dụng các điều kiện tìm kiếm
    if (title) {
      queryBuilder.andWhere('exam.title LIKE :title', { title: `%${title}%` });
    }

    if (description) {
      queryBuilder.andWhere('exam.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (startTime) {
      queryBuilder.andWhere('exam.startTime >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('exam.endTime <= :endTime', { endTime });
    }

    if (classId) {
      queryBuilder.andWhere('exam.class.id = :classId', { classId });
    }

    if (user.type !== UserType.MASTER) {
      queryBuilder.andWhere('exam.user.id = :userId', { userId: user.id });
    }

    if (pagination) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    // Tính toán phân trang
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total }; // Trả về dữ liệu và tổng số lượng
  }

  async findAllMe(
    query: ExamQueryDto,
    user: User,
  ): Promise<{ data: Exam[]; total: number }> {
    const {
      title,
      description,
      startTime,
      endTime,
      classId,
      page = 1,
      limit = 10,
      pagination = true,
    } = query;

    const queryBuilder = this.examRepository

      .createQueryBuilder('exam')
      .select([
        'exam.id',
        'exam.title',
        'exam.startTime',
        'exam.endTime',
        'class.id',
        'class.name',
        'major.id',
        'major.name',
        'major.code',
        'submissions.createdAt',
        'submissions.id',
        'submission_user.id',
        'teachers.name',
        'teachers.id',
      ])
      .leftJoin('exam.class', 'class')
      .leftJoin('class.major', 'major')
      .leftJoin('class.teachers', 'teachers')
      .leftJoin('class.users', 'user')
      .leftJoin('exam.submissions', 'submissions')
      .leftJoin('submissions.user', 'submission_user')
      .where('user.id = :userId', { userId: user.id });

    // Áp dụng các điều kiện tìm kiếm
    if (title) {
      queryBuilder.andWhere('exam.title LIKE :title', { title: `%${title}%` });
    }

    if (description) {
      queryBuilder.andWhere('exam.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (startTime) {
      queryBuilder.andWhere('exam.startTime >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('exam.endTime <= :endTime', { endTime });
    }

    if (classId) {
      queryBuilder.andWhere('exam.class.id = :classId', { classId });
    }

    if (pagination) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    // Tính toán phân trang
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total }; // Trả về dữ liệu và tổng số lượng
  }
  async findOne(id: number, user?: User): Promise<Exam> {
    const examEntity = await this.examRepository.findOne({
      where: { id },
      relations: ['questions', 'class'],
    });
    if (user) {
      checkUserPermission(examEntity.user.id, user);
    }
    if (!examEntity) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return examEntity;
  }

  async joinExam(id: number, user: User): Promise<Exam> {
    const exam = await this.findOne(id);

    const isExisted = await this.classService.checkExistedUser(
      exam.class.id,
      user.id,
    );
    if (!isExisted) {
      throw new NotFoundException(`Class with ID ${exam.class.id} not found`);
    }

    if (new Date() < exam.startTime) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    if (new Date() > exam.endTime) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    exam.questions = await this.questionService.getQuestionByExamId(id);

    return exam;
  }

  async update(
    id: number,
    updateExamDto: UpdateExamDto,
    user: User,
  ): Promise<Exam> {
    const exam = await this.findOne(id, user);

    Object.assign(exam, updateExamDto);

    return await this.examRepository.save(exam);
  }

  async remove(id: number, user: User): Promise<Exam> {
    const exam = await this.findOne(id, user);
    return this.examRepository.remove(exam);
  }
}
