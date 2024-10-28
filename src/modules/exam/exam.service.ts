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
import {ExamQuestion} from "./exam-question/exam-question.entity";
import {ExamLog} from "./exam-log/exam-log.entity";

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
  ) {}

  async create(createExamDto: CreateExamDto, user: User): Promise<Exam> {
    const { classId, description, endTime, startTime, title, questions } = createExamDto;

    // Tạo exam mới
    const exam = this.examRepository.create({
      title,
      description,
      endTime,
      startTime,
      class: { id: classId },
      user: { id: user.id },
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
      relations: ['examQuestions', 'class','user'],
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
    const query = this.examRepository.createQueryBuilder('exam')
        .select(['exam','submissions','examQuestions','question.id','question.title','question.content','question.type','question.choices', 'question.initCode','question.acceptedLanguages','testCases'])
        .leftJoin('exam.class', 'class')
        .leftJoin('class.users', 'users','users.id = :userId', {userId: user.id})
        .leftJoin('exam.examQuestions', 'examQuestions')
        .leftJoin('examQuestions.question', 'question')
        .leftJoin('question.testCases','testCases','testCases.isHidden = false')
        .leftJoin('exam.submissions', 'submissions','submissions.user.id = :userId', {userId: user.id})
        .where('users.id = :userId', { userId: user.id })
        .andWhere('exam.id = :id', { id }).andWhere('exam.startTime <= :now', { now: new Date() })
        .andWhere('exam.endTime >= :now', { now: new Date() });

    const exam = await query.getOne();

    if(!exam) throw new NotFoundException(`Exam with ID ${id} not found`);

    exam.examQuestions.forEach(eq => {
      eq.question.choices = eq.question.choices.map(c => {
          return {text: c.text}
      }) as any
    })

    // exam.examQuestions = await this.examQuestionRepository.find({where:{exam: {id}}});
    this.updateStartTimeLog(id, user.id);

    return exam;
  }

  async update(
      id: number,
      updateExamDto: UpdateExamDto,
      user: User,
  ): Promise<Exam> {
    const exam = await this.findOne(id, user);

    // Cập nhật các thuộc tính của Exam (nếu có trong DTO)
    Object.assign(exam, {
      title: updateExamDto.title ?? exam.title,
      description: updateExamDto.description ?? exam.description,
      startTime: updateExamDto.startTime ?? exam.startTime,
      endTime: updateExamDto.endTime ?? exam.endTime,
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
          const question = await this.questionService.getQuestionById(questionId);
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

  async updateStartTimeLog(examId: number, studentId: number){
    const examLog = await this.examLogRepository.findOne({where:{
      exam:{id: examId},
      student:{id: studentId}
      }})
    if(!examLog){
      await this.examLogRepository.create({
        exam: {id: examId},
        student: {id: studentId},
        startTime: new Date()
      })
    }
  }

  async updateEndTimeLog(examId: number, studentId: number){
    const examLog = await this.examLogRepository.findOne({where:{
        exam:{id: examId},
        student:{id: studentId}
      }})
    if(examLog){
      examLog.endTime = new Date();
      await this.examLogRepository.save(examLog);
    }else{
      await this.examLogRepository.create({
        exam: {id: examId},
        student: {id: studentId},
        endTime: new Date()
      })
    }
  }

  async hasSubmission(examId: number, studentId: number){
    const examLog = await this.examLogRepository.findOne({where:{
        exam:{id: examId},
        student:{id: studentId}
      }})
    return examLog;
  }

  async getExamQuestion(id: number): Promise<ExamQuestion> {
    const examQuestion = await this.examQuestionRepository.findOne({
      where: { id },
      relations: ['question'],
    });
    if (!examQuestion) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return examQuestion;
  }
}
