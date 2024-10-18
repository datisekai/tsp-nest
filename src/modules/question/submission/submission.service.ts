import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../question.entity';
import { QuestionType } from '../question.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async submitMultipleChoice(
    userId: number,
    questionId: number,
    answer: string,
  ): Promise<Submission> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question || question.type !== QuestionType.MULTIPLE_CHOICE) {
      throw new NotFoundException('Multiple choice question not found');
    }

    const isCorrect = question.choices.some(
      (choice) => choice.text === answer && choice.isCorrect,
    );

    const submission = this.submissionRepository.create({
      user: { id: userId },
      question,
      answer,
      result: isCorrect,
    });

    await this.submissionRepository.save(submission);
    delete submission['result'];
    return submission;
  }

  async submitCode(
    userId: number,
    questionId: number,
    language: string,
    code: string,
  ): Promise<Submission> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['testCases'],
    });
    if (!question || question.type !== QuestionType.CODE) {
      throw new NotFoundException('Coding question not found');
    }

    const submission = this.submissionRepository.create({
      user: { id: userId },
      question,
      language,
      code,
    });

    // const testResults = [];

    // Chạy từng test case với Judge0
    // for (const testCase of question.testCases) {
    //   const result = await this.judge0Service.submitCode(
    //     language,
    //     code,
    //     testCase.input,
    //   );
    //   const isCorrect = result.stdout === testCase.expectedOutput;
    //   testResults.push({
    //     testCaseId: testCase.id,
    //     status: isCorrect ? 'PASSED' : 'FAILED',
    //     output: result.stdout,
    //   });
    // }

    submission.result = true;
    await this.submissionRepository.save(submission);

    delete submission['result'];

    return submission;
  }
}
