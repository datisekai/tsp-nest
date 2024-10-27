import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../question.entity';
import { QuestionType } from '../question.dto';
import { SubmitCodeDto } from './submission.dto';
import { User } from 'src/modules/user/user.entity';
import { Judge0Service } from 'src/modules/judge0/judge0.service';

const JUDGE0_SUCCESS_STATUS = 3;
@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    private readonly judge0Service: Judge0Service,
  ) {}

  async submitMultipleChoice(
    userId: number,
    questionId: number,
    answer: string,
    examId: number,
  ): Promise<{ data: boolean }> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question || question.type !== QuestionType.MULTIPLE_CHOICE) {
      throw new NotFoundException('Multiple choice question not found');
    }

    const isCorrect = question.choices.some(
      (choice) => choice.text === answer && choice.isCorrect,
    );

    // Tìm submission có cùng userId, questionId và examId
    let submission = await this.submissionRepository.findOne({
      where: { user: { id: userId }, question: { id: questionId }, exam: { id: examId } },
    });

    if (submission) {
      // Nếu đã có submission, cập nhật thông tin
      submission.answer = answer;
      submission.grade = isCorrect ? 10 : 0;
    } else {
      // Nếu chưa có submission, tạo mới
      submission = this.submissionRepository.create({
        user: { id: userId },
        question,
        answer,
        grade: isCorrect ? 10 : 0,
        exam: { id: examId },
      });
    }

    await this.submissionRepository.save(submission);
    return { data: true };
  }

  async submitCode(dto: SubmitCodeDto, user: User): Promise<{ data: true }> {
    const { code, examId, languageId, questionId } = dto;
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['testCases'],
    });
    if (!question || question.type !== QuestionType.CODE) {
      throw new NotFoundException('Coding question not found');
    }

    // Tìm submission có cùng userId, questionId và examId
    let submission = await this.submissionRepository.findOne({
      where: { user: { id: user.id }, question: { id: questionId }, exam: { id: examId } },
    });

    const testResults = [];
    let grade = 0;

    // Chạy từng test case với Judge0
    for (const testCase of question.testCases) {
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
        question,
        languageId,
        code,
        exam: { id: examId },
        resultJudge0: testResults,
        grade,
      });
    }

    await this.submissionRepository.save(submission);

    return { data: true };
  }
}
