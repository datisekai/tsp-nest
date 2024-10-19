import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meta } from './meta.entity';
import { META_KEY, UpdateMetaDto } from './meta.dto';

@Injectable()
export class MetaService {
  constructor(
    @InjectRepository(Meta)
    private readonly metaRepository: Repository<Meta>,
  ) {}

  // Cập nhật hoặc tạo mới Meta với key = 'setting'
  async updateMeta(key: META_KEY, updateMetaDto: UpdateMetaDto): Promise<Meta> {
    const { value } = updateMetaDto;

    // Tìm meta theo key
    let meta = await this.metaRepository.findOne({ where: { key } });

    if (!meta) {
      // Nếu không tìm thấy, tạo mới
      meta = this.metaRepository.create({ key, value });
    } else {
      // Nếu có rồi, cập nhật value
      meta.value = value;
    }

    return this.metaRepository.save(meta);
  }

  // Lấy Meta theo key
  async getMetaByKey(key: string): Promise<Meta> {
    const meta = await this.metaRepository.findOne({ where: { key } });
    console.log('meta', meta);

    if (!meta) {
      throw new NotFoundException(`Meta with key ${key} not found`);
    }

    return meta;
  }
}
