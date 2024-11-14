import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../question.entity';
import { QuestionType } from '../question.dto';
import { RunTestCodeDto, SubmitCodeDto } from './submission.dto';
import { User } from 'src/modules/user/user.entity';
import { Judge0Service } from 'src/modules/judge0/judge0.service';
import { ExamService } from '../../exam/exam.service';

const JUDGE0_SUCCESS_STATUS = 3;
@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    private readonly judge0Service: Judge0Service,
    private readonly examService: ExamService,
  ) {}

  async submitMultipleChoice(
    userId: number,
    examQuestionId: number,
    answer: string,
    examId: number,
  ): Promise<{ data: boolean }> {
    const hasSubmission = await this.examService.hasSubmission(examId, userId);
    if (hasSubmission)
      throw new NotFoundException(`Exam with ID ${examId} has been submitted`);
    const examQuestion = await this.examService.getExamQuestion(examQuestionId);
    if (
      !examQuestion ||
      examQuestion.question.type !== QuestionType.MULTIPLE_CHOICE
    ) {
      throw new NotFoundException('Multiple choice question not found');
    }

    const isCorrect = examQuestion.question.choices.some(
      (choice) => choice.text === answer && choice.isCorrect,
    );

    // Tìm submission có cùng userId, examQuestionId và examId
    let submission = await this.submissionRepository.findOne({
      where: {
        user: { id: userId },
        examQuestion: { id: examQuestionId },
        exam: { id: examId },
      },
    });

    if (submission) {
      // Nếu đã có submission, cập nhật thông tin
      submission.answer = answer;
      submission.grade = isCorrect ? examQuestion.score : 0;
    } else {
      // Nếu chưa có submission, tạo mới
      submission = this.submissionRepository.create({
        user: { id: userId },
        examQuestion: { id: examQuestionId },
        answer,
        grade: isCorrect ? examQuestion.score : 0,
        exam: { id: examId },
      });
    }

    submission.questionTemp = examQuestion.question;
    await this.submissionRepository.save(submission);
    return { data: true };
  }

  async runTestCode(dto: RunTestCodeDto): Promise<any> {
    const { expected_output, language_id, source_code, stdin } = dto;
    const result = await this.judge0Service.testCode({
      language_id: language_id,
      expected_output: expected_output,
      source_code: source_code,
      stdin: stdin,
    });

    return result;
  }

  async submitCode(dto: SubmitCodeDto, user: User): Promise<{ data: true }> {
    const hasSubmission = await this.examService.hasSubmission(
      dto.examId,
      user.id,
    );
    if (hasSubmission)
      throw new NotFoundException(
        `Exam with ID ${dto.examId} has been submitted`,
      );
    const { code, examId, languageId, examQuestionId } = dto;
    const examQuestion = await this.examService.getExamQuestion(examQuestionId);

    if (!examQuestion || examQuestion.question.type !== QuestionType.CODE) {
      throw new NotFoundException('Coding question not found');
    }

    // Tìm submission có cùng userId, examQuestionId và examId
    let submission = await this.submissionRepository.findOne({
      where: {
        user: { id: user.id },
        examQuestion: { id: examQuestionId },
        exam: { id: examId },
      },
    });

    const testResults = [];
    let grade = 0;

    console.log('examQuestion', examQuestion);

    // Chạy từng test case với Judge0
    for (const testCase of examQuestion.question.testCases) {
      const result = await this.judge0Service.submitCode({
        language_id: languageId,
        expected_output: testCase.expectedOutput,
        source_code: code,
        stdin: testCase.input,
      });
      testResults.push(result);
      if (result.status.id == JUDGE0_SUCCESS_STATUS) {
        grade += testCase.grade;
      }
    }

    if (submission) {
      // Nếu đã có submission, cập nhật thông tin
      submission.code = code;
      submission.languageId = languageId;
      submission.resultJudge0 = testResults;
      submission.grade = grade;
    } else {
      // Nếu chưa có submission, tạo mới
      submission = this.submissionRepository.create({
        user: { id: user.id },
        examQuestion,
        languageId,
        code,
        exam: { id: examId },
        resultJudge0: testResults,
        grade,
      });
    }

    submission.questionTemp = examQuestion.question;

    await this.submissionRepository.save(submission);

    return { data: true };
  }

  async getStudentGradesByExam(examId: number) {
    const studentGrades = await this.submissionRepository
      .createQueryBuilder('submission')
      .select('submission.userId', 'userId')
      .addSelect('SUM(submission.grade)', 'grade')
      .where('submission.examId = :examId', { examId })
      .groupBy('submission.userId')
      .leftJoin('submission.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.code'])
      .leftJoin('submission.exam', 'exam')
      .addSelect(['exam.id', 'exam.title', 'exam.classId'])
      .getRawMany();

    return studentGrades;
  }

  async getMySubmissionOfExam(examId: number, user: User){
    const exam = await this.examService.findOne(examId);

    const qb = this.submissionRepository.createQueryBuilder('submission')
    .where('submission.exam.id = :id',{id: examId})
    .andWhere('submission.user.id = :userId', {userId: user.id}).leftJoin('submission.examQuestion','examQuestion')
    .select(['submission.id','examQuestion.id','submission.languageId','submission.code','submission.answer','submission.questionTemp'])

    if(exam.showResult){
      qb.addSelect(['submission.resultJudge0','submission.grade'])
    }

    const submissions = await qb.getMany();

    if(!exam.showResult){
      submissions.forEach(sub => {
        if(sub.questionTemp && sub.questionTemp.choices){
          sub.questionTemp.choices = sub.questionTemp.choices?.map((c) => {
            return { text: c.text };
          }) as any;
        }
      })
    }


    return {data: {submissions, showResult: exam.showResult}}
  }
}
