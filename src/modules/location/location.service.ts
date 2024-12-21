import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';
import { User } from '../user/user.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  // Create a new location
  async create(createLocationDto: CreateLocationDto, user: User) {
    const location = this.locationRepository.create({
      ...createLocationDto,
      user: { id: user.id },
    });
    return await this.locationRepository.save(location);
  }

  // Get all locations
  async findAll(): Promise<Location[]> {
    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .leftJoin('location.user', 'user')
      .addSelect(['user.name', 'user.code', 'user.id']);

    const locations = await queryBuilder.getMany();
    return locations;
  }

  // Get a location by ID
  async findOne(id: number): Promise<Location> {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }

  // Update a location
  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.findOne(id);
    Object.assign(location, updateLocationDto);
    return await this.locationRepository.save(location);
  }

  // Delete a location
  async remove(id: number): Promise<Location> {
    const location = await this.findOne(id);
    location.isDeleted = true;
    return await this.locationRepository.save(location);
  }
}
