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
    const { name, image, content, classIds } = createNotificationDto;

    // Tìm các lớp học liên quan
    const classes = await this.classService.findByIds(classIds);
    if (!classes || classes.length === 0) {
      throw new NotFoundException(`Classes with IDs ${classIds} not found`);
    }

    // Tìm người tạo thông báo dựa trên ID từ req.user
    const creator = await this.userService.findOne(creatorId);
    if (!creator) {
      throw new NotFoundException(`User with ID ${creatorId} not found`);
    }

    // Tạo thông báo mới với thông tin người tạo và các lớp liên quan
    const notification = this.notificationRepository.create({
      name,
      image,
      content,
      classes, // Gán danh sách các lớp vào thông báo
      creator, // Lưu người tạo vào thông báo
    });

    return this.notificationRepository.save(notification);
  }

  // Cập nhật một Notification
  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const { name, image, content, classIds } = updateNotificationDto;

    // Tìm thông báo cần cập nhật
    const notification = await this.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Cập nhật các thuộc tính của thông báo
    if (name) notification.name = name;
    if (image) notification.image = image;
    if (content) notification.content = content;

    // Cập nhật quan hệ với các lớp (Class)
    if (classIds && classIds.length > 0) {
      const classes = await this.classService.findByIds(classIds);
      if (!classes || classes.length === 0) {
        throw new NotFoundException(`Classes with IDs ${classIds} not found`);
      }
      notification.classes = classes; // Gán danh sách các lớp cho thông báo
    }

    // Lưu thông báo đã cập nhật
    return this.notificationRepository.save(notification);
  }

  // Lấy tất cả thông báo với phân trang và tìm kiếm theo name, class
  async findAll(
    queryNotificationDto: QueryNotificationDto,
    user: User,
  ): Promise<{ data: Notification[]; total: number }> {
    const {
      name,
      classIds,
      page = 1,
      limit = 10,
      pagination,
    } = queryNotificationDto;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .innerJoin('notification.classes', 'class'); // Tham gia bảng trung gian với bảng Class

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
    if (classIds && classIds.length > 0) {
      queryBuilder.andWhere('class.id IN (:...classIds)', { classIds }); // Lọc theo các classIds
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
