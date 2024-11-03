import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentScore } from './student-score.entity';
import { ScoreColumnService } from '../score-column/score-column.service';
import { UserService } from 'src/modules/user/user.service';
import { CreateStudentScoreDto } from './student-score.dto';

@Injectable()
export class StudentScoreService {
  constructor(
    @InjectRepository(StudentScore)
    private studentScoreRepository: Repository<StudentScore>,
    private scoreColumnService: ScoreColumnService,
    private userService: UserService,
  ) {}

  async update(
    createStudentScoreDtos: CreateStudentScoreDto[],
  ): Promise<StudentScore[]> {
    const updatedScores: StudentScore[] = [];

    for (const dto of createStudentScoreDtos) {
      const scoreColumn = await this.scoreColumnService.findOne(
        dto.scoreColumnId,
      );
      const student = await this.userService.findOne(dto.studentId);

      if (!scoreColumn || !student) {
        throw new NotFoundException('Score column or student not found');
      }

      let studentScore = await this.studentScoreRepository.findOne({
        where: { student: student, scoreColumn: scoreColumn },
      });

      if (studentScore) {
        // Nếu đã tồn tại, cập nhật điểm
        studentScore.score = dto.score;
        updatedScores.push(studentScore);
      } else {
        // Nếu chưa tồn tại, tạo mới
        studentScore = this.studentScoreRepository.create({
          ...dto,
          student,
          scoreColumn,
        });
        updatedScores.push(studentScore);
      }
    }

    // Lưu tất cả các điểm đã cập nhật và mới vào cơ sở dữ liệu
    return this.studentScoreRepository.save(updatedScores);
  }

  async getStudentScoresWithColumnsByClassId(classId: number) {
    const scores = await this.studentScoreRepository
      .createQueryBuilder('studentScore')
      .leftJoinAndSelect('studentScore.student', 'student')
      .leftJoinAndSelect('studentScore.scoreColumn', 'scoreColumn')
      .where('scoreColumn.classId = :classId', { classId }) // Điều kiện cho classId
      .getMany();

    return {
      data: scores.map((score) => ({
        studentId: score.student.id,
        studentName: score.student.name,
        studentCode: score.student.code,
        scoreColumnId: score.scoreColumn.id,
        scoreColumnName: score.scoreColumn.name,
        scoreColumnWeight: score.scoreColumn.weight,
        score: score.score,
      })),
    };
  }
}
