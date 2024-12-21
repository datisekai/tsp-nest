import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  // Create a new location
  async create(createLocationDto: CreateLocationDto) {
    const location = this.locationRepository.create(createLocationDto);
    return await this.locationRepository.save(location);
  }

  // Get all locations
  async findAll(): Promise<Location[]> {
    return this.locationRepository.find({ where: { isDeleted: false } });
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
