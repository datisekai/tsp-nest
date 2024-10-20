import { InjectRepository } from '@nestjs/typeorm';
import { Difficulty } from './difficulty.entity';
import { Repository } from 'typeorm';
import { CreateDifficultyDto } from '../question.dto';

export class DifficultyService {
  constructor(
    @InjectRepository(Difficulty)
    private difficultyRepository: Repository<Difficulty>,
  ) {}

  async createDifficulty(
    createDifficultyDto: CreateDifficultyDto,
  ): Promise<Difficulty> {
    const { level } = createDifficultyDto;
    const difficulty = this.difficultyRepository.create({ level });
    return await this.difficultyRepository.save(difficulty);
  }

  async deleteDifficulty(id: number): Promise<Difficulty> {
    const difficulty = await this.difficultyRepository.findOneBy({ id });
    return await this.difficultyRepository.remove(difficulty);
  }

  async getAllDifficulties(): Promise<{ data: Difficulty[] }> {
    const difficulties = await this.difficultyRepository.find();
    return { data: difficulties };
  }
}
