import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Exam } from './exam.entity';
import {
  CreateExamDto,
  ExamQueryDto,
  ExamUserLogMultipleDto,
  UpdateExamDto,
} from './exam.dto';
import { QuestionService } from '../question/question.service';
import { User } from '../user/user.entity';
import { UserType } from '../user/user.dto';
import { checkUserPermission } from 'src/common/helpers/checkPermission';
import { ClassService } from '../class/class.service';
import { ExamQuestion } from './exam-question/exam-question.entity';
import { ExamLog } from './exam-log/exam-log.entity';
import { SubmissionService } from '../question/submission/submission.service';
import { ExamUserLog } from './exam-user-log/exam-user-log.entity';
import { duration } from 'moment';

@Injectable()
export class ExamService {
  constructor(
    private readonly questionService: QuestionService,
    private readonly classService: ClassService,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(ExamQuestion)
    private readonly examQuestionRepository: Repository<ExamQuestion>,
    @InjectRepository(ExamLog)
    private readonly examLogRepository: Repository<ExamLog>,
    @InjectRepository(ExamUserLog)
    private readonly examUserLogRepository: Repository<ExamUserLog>,
  ) {}

  async create(createExamDto: CreateExamDto, user: User): Promise<Exam> {
    const {
      classId,
      description,
      endTime,
      startTime,
      title,
      questions,
      showResult = false,
      blockControlCVX,
      blockMouseRight,
      logOutTab,
      duration,
    } = createExamDto;

    // Tạo exam mới
    const exam = this.examRepository.create({
      title,
      description,
      endTime,
      startTime,
      class: { id: classId },
      user: { id: user.id },
      showResult,
      blockControlCVX,
      blockMouseRight,
      logOutTab,
      duration,
    });

    // Lưu exam vào database để lấy id
    await this.examRepository.save(exam);

    // Tạo ExamQuestion cho từng câu hỏi với điểm số tương ứng
    for (const { questionId, score } of questions) {
      const question = await this.questionService.getQuestionById(questionId);
      if (question) {
        const examQuestion = this.examQuestionRepository.create({
          exam,
          question,
          score,
        });
        await this.examQuestionRepository.save(examQuestion);
      }
    }

    return exam;
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
      pagination,
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

    if (JSON.parse(pagination || 'true')) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    queryBuilder.addOrderBy('exam.createdAt', 'DESC');
    queryBuilder.leftJoin('exam.class', 'class');
    queryBuilder
      .leftJoin('class.major', 'major')
      .addSelect(['class.name', 'major.name', 'major.code', 'class.id']);
    // Tính toán phân trang
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total }; // Trả về dữ liệu và tổng số lượng
  }

  async findMeByExamId(examId: number, user: User) {
    const queryBuilder = this.examRepository
      .createQueryBuilder('exam')
      .select([
        'exam.id',
        'exam.title',
        'exam.startTime',
        'exam.endTime',
        'exam.showResult',
        'submissions.createdAt',
        'submissions.id',
        'examLogs.startTime',
        'examLogs.endTime',
        'examQuestions',
        'question.id',
        'question.title',
        'question.content',
        'question.type',
        'question.choices',
        'question.initCode',
        'question.acceptedLanguages',
      ])
      .leftJoin('exam.examQuestions', 'examQuestions')
      .leftJoin('examQuestions.question', 'question')
      .leftJoin(
        'exam.submissions',
        'submissions',
        'submissions.user.id = :userId',
        { userId: user.id },
      )
      .leftJoin('exam.examLogs', 'examLogs', 'examLogs.student.id = :userId', {
        userId: user.id,
      })
      .andWhere('exam.id = :examId', { examId });
    const exam = await queryBuilder.getOne();

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }
    return { data: exam };
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
      pagination,
    } = query;

    const queryBuilder = this.examRepository
      .createQueryBuilder('exam')
      .select([
        'exam.id',
        'exam.title',
        'exam.startTime',
        'exam.endTime',
        'exam.showResult',
        'exam.createdAt',
        'class.id',
        'class.name',
        'major.id',
        'major.name',
        'major.code',
        'submissions.createdAt',
        'submissions.id',
        'submission_user.id',
        'submissions.languageId',
        'teachers.name',
        'teachers.id',
        'examLog.startTime',
        'examLog.endTime',
      ])
      .leftJoin('exam.class', 'class')
      .leftJoin('class.major', 'major')
      .leftJoin('class.teachers', 'teachers')
      .leftJoin('class.users', 'user')
      .leftJoin('exam.submissions', 'submissions')
      .leftJoin('submissions.user', 'submission_user')
      .leftJoin('exam.examLogs', 'examLog', 'examLog.student.id = :userId', {
        userId: user.id,
      })
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

    if (JSON.parse(pagination || 'true')) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    queryBuilder.addOrderBy('exam.createdAt', 'DESC');
    // Tính toán phân trang
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total }; // Trả về dữ liệu và tổng số lượng
  }
  async findOne(id: number, user?: User): Promise<Exam> {
    const examEntity = await this.examRepository.findOne({
      where: { id },
      relations: {
        examQuestions: {
          question: {
            chapter: true,
            difficulty: true,
          },
        },
        class: true,
        user: true,
      },
    });

    console.log('findOne', examEntity.user, user);
    if (user) {
      checkUserPermission(examEntity.user.id, user);
    }
    if (!examEntity) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return examEntity;
  }

  async joinExam(id: number, user: User): Promise<Exam> {
    const query = this.examRepository
      .createQueryBuilder('exam')
      .select([
        'exam',
        'submissions',
        'examQuestions',
        'question.id',
        'question.title',
        'question.content',
        'question.type',
        'question.choices',
        'question.initCode',
        'question.acceptedLanguages',
        'testCases',
        'submissionExamQuestion.id',
      ])
      .leftJoin('exam.class', 'class')
      .leftJoin('class.users', 'users', 'users.id = :userId', {
        userId: user.id,
      })
      .leftJoin('exam.examQuestions', 'examQuestions')
      .leftJoin('examQuestions.question', 'question')
      .leftJoin('question.testCases', 'testCases', 'testCases.isHidden = false')
      .leftJoin(
        'exam.submissions',
        'submissions',
        'submissions.user.id = :userId',
        { userId: user.id },
      )
      .leftJoin('submissions.examQuestion', 'submissionExamQuestion')
      .where('users.id = :userId', { userId: user.id })
      .andWhere('exam.id = :examId', { examId: id })
      .andWhere('exam.startTime <= :now', { now: new Date() })
      .andWhere('exam.endTime >= :now', { now: new Date() });

    const exam = await query.getOne();

    if (!exam)
      throw new NotFoundException(
        `You have submitted or exam with ID ${id} not found`,
      );

    const examLog = await this.examLogRepository.findOne({
      where: {
        student: {
          id: user.id,
        },
        exam: { id },
      },
    });

    if (examLog && examLog.startTime) {
      const duration = exam.duration * 60 * 60;
      const timeLeft =
        new Date(examLog.startTime).getTime() + duration - Date.now();
      if (timeLeft < 0) {
        throw new NotFoundException(`Exam time out.`);
      }
    }

    if (examLog && examLog.endTime) {
      throw new NotFoundException(`You have submitted.`);
    }

    exam.examQuestions.forEach((eq) => {
      eq.question.choices = eq.question.choices?.map((c) => {
        return { text: c.text };
      }) as any;
    });

    // exam.examQuestions = await this.examQuestionRepository.find({where:{exam: {id}}});
    await this.updateStartTimeLog(id, user.id);

    return exam;
  }

  async getTakeOrderQuestionOfExam(id: number, user: User) {
    console.log('getTakeOrderQuestionOfExam', id);
    const qb = this.examQuestionRepository
      .createQueryBuilder('examQuestion')
      .where('examQuestion.exam.id = :examId', { examId: id })
      .select(['examQuestion.id']);
    const data = await qb.getMany();
    return { data: data.map((item) => item.id) };
  }

  async update(
    id: number,
    updateExamDto: UpdateExamDto,
    user: User,
  ): Promise<Exam> {
    console.log('123333');
    const exam = await this.findOne(id, user);

    // Cập nhật các thuộc tính của Exam (nếu có trong DTO)
    Object.assign(exam, {
      title: updateExamDto.title ?? exam.title,
      description: updateExamDto.description ?? exam.description,
      startTime: updateExamDto.startTime ?? exam.startTime,
      duration: updateExamDto.duration ?? exam.duration,
      endTime: updateExamDto.endTime ?? exam.endTime,
      showResult:
        updateExamDto.showResult != null
          ? updateExamDto.showResult
          : exam.showResult,
      logOutTab:
        updateExamDto.logOutTab != null
          ? updateExamDto.logOutTab
          : exam.logOutTab,
      blockControlCVX:
        updateExamDto.blockControlCVX != null
          ? updateExamDto.blockControlCVX
          : exam.blockControlCVX,
      blockMouseRight:
        updateExamDto.blockMouseRight != null
          ? updateExamDto.blockMouseRight
          : exam.blockMouseRight,
      isLink: updateExamDto.isLink != null ? updateExamDto.isLink : exam.isLink,
    });

    // Lưu thay đổi của Exam
    await this.examRepository.save(exam);

    // Nếu có danh sách câu hỏi cần cập nhật
    if (updateExamDto.questions) {
      for (const { questionId, score } of updateExamDto.questions) {
        const examQuestion = await this.examQuestionRepository.findOne({
          where: { exam: { id }, question: { id: questionId } },
        });

        if (examQuestion) {
          // Cập nhật điểm số nếu ExamQuestion đã tồn tại
          examQuestion.score = score;
          await this.examQuestionRepository.save(examQuestion);
        } else {
          // Nếu ExamQuestion chưa tồn tại, tạo mới
          const question =
            await this.questionService.getQuestionById(questionId);
          if (question) {
            const newExamQuestion = this.examQuestionRepository.create({
              exam,
              question,
              score,
            });
            await this.examQuestionRepository.save(newExamQuestion);
          }
        }
      }
    }

    return exam;
  }

  async remove(id: number, user: User): Promise<Exam> {
    const exam = await this.findOne(id, user);
    return this.examRepository.remove(exam);
  }

  async updateStartTimeLog(examId: number, studentId: number) {
    const examLog = await this.examLogRepository.findOne({
      where: {
        exam: { id: examId },
        student: { id: studentId },
      },
    });
    if (!examLog) {
      const newExamLog = this.examLogRepository.create({
        exam: { id: examId },
        student: { id: studentId },
        startTime: new Date(),
      });
      await this.examLogRepository.save(newExamLog);
    }
  }

  async updateEndTimeLog(examId: number, studentId: number) {
    const examLog = await this.examLogRepository.findOne({
      where: {
        exam: { id: examId },
        student: { id: studentId },
      },
    });
    if (examLog) {
      examLog.endTime = new Date();
      await this.examLogRepository.save(examLog);
    } else {
      await this.examLogRepository.create({
        exam: { id: examId },
        student: { id: studentId },
        endTime: new Date(),
      });
    }

    return { data: true };
  }

  async hasSubmission(examId: number, studentId: number) {
    const examLog = await this.examLogRepository.findOne({
      where: {
        exam: { id: examId },
        student: { id: studentId },
        endTime: Not(IsNull()),
      },
    });
    console.log('hasSubmission', examLog);
    return examLog;
  }

  async getExamQuestion(id: number): Promise<ExamQuestion> {
    const examQuestion = await this.examQuestionRepository.findOne({
      where: { id },
      relations: {
        question: {
          testCases: true,
        },
      },
    });
    if (!examQuestion) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return examQuestion;
  }

  async createExamUserLog(
    examId: number,
    studentId: number,
    data: ExamUserLogMultipleDto,
  ) {
    const newItems = [];
    data.data.forEach((item) => {
      const newItem = this.examUserLogRepository.create({
        exam: { id: examId },
        student: { id: studentId },
        action: item.action,
      });
      newItems.push(newItem);
    });

    await this.examUserLogRepository.save(newItems);
    return { data: true };
  }

  getExamUserLogs(examId: number, studentId: number) {
    return this.examUserLogRepository.find({
      where: {
        exam: { id: examId },
        student: { id: studentId },
      },
    });
  }
}
