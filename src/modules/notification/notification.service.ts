import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  QueryNotificationDto,
} from './notification.dto';
import { ClassService } from '../class/class.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { UserType } from '../user/user.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly classService: ClassService,
    private readonly userService: UserService,
  ) {}

  // Tạo mới một Notification
  async create(
    createNotificationDto: CreateNotificationDto,
    creatorId: number,
  ): Promise<Notification> {
    const { name, image, content, classId } = createNotificationDto;

    // Tìm lớp học liên quan
    const classEntity = await this.classService.findOne(classId);
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Tìm người tạo thông báo dựa trên ID từ req.user
    const creator = await this.userService.findOne(creatorId);
    if (!creator) {
      throw new NotFoundException(`User with ID ${creatorId} not found`);
    }

    // Tạo thông báo mới với thông tin người tạo
    const notification = this.notificationRepository.create({
      name,
      image,
      content,
      class: classEntity,
      creator, // Lưu người tạo vào thông báo
    });

    return this.notificationRepository.save(notification);
  }

  // Cập nhật một Notification
  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const { name, image, content, classId } = updateNotificationDto;

    const notification = await this.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (name) notification.name = name;
    if (image) notification.image = image;
    if (content) notification.content = content;

    if (classId) {
      const classEntity = await this.classService.findOne(classId);
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classId} not found`);
      }
      notification.class = classEntity;
    }

    return this.notificationRepository.save(notification);
  }

  // Lấy tất cả thông báo với phân trang và tìm kiếm theo name, class
  async findAll(
    queryNotificationDto: QueryNotificationDto,
    user: User,
  ): Promise<{ data: Notification[]; total: number }> {
    const {
      name,
      classId,
      page = 1,
      limit = 10,
      pagination,
    } = queryNotificationDto;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.class', 'class');

    // Tìm kiếm theo name nếu có
    if (name) {
      queryBuilder.andWhere('notification.name LIKE :name', {
        name: `%${name}%`,
      });
    }
    if (user.type !== UserType.MASTER) {
      queryBuilder.andWhere('notification.creator.id = :ownerId', {
        ownerId: user.id,
      });
    }

    // Tìm kiếm theo classId nếu có
    if (classId) {
      queryBuilder.andWhere('notification.class.id = :classId', { classId });
    }

    if (pagination) {
      queryBuilder
        .skip((page - 1) * limit) // Tính toán offset
        .take(limit); // Số bản ghi mỗi trang
    }

    // Phân trang
    const [data, total] = await queryBuilder

      .orderBy('notification.createdAt', 'DESC') // Sắp xếp theo thời gian tạo mới nhất
      .getManyAndCount();

    return { data, total };
  }

  // Tìm một thông báo theo ID
  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['class'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  // Xóa một thông báo
  async delete(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    return await this.notificationRepository.remove(notification);
  }

  async findNotificationsByUser(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<{ data: Notification[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.class', 'class')
      .leftJoinAndSelect('class.major', 'major')
      .leftJoin('class.users', 'user')
      .where('user.id = :userId', { userId })
      .select([
        'notification.id',
        'notification.name',
        'notification.content',
        'notification.createdAt',
        'class.id',
        'class.name',
        'major.id',
        'major.name',
      ]);

    // Phân trang
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit) // Tính offset
      .take(limit) // Số bản ghi mỗi trang
      .orderBy('notification.createdAt', 'DESC') // Sắp xếp theo thời gian tạo mới nhất
      .getManyAndCount(); // Trả về danh sách dữ liệu và tổng số bản ghi

    return { data, total };
  }
}
