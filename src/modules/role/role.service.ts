import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../permission/permission.entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  QueryRoleDto,
} from './role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async findAll(
    queryRoleDto: QueryRoleDto,
  ): Promise<{ data: Role[]; total: number }> {
    const { name, page = 1, limit = 10 } = queryRoleDto;

    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // Tìm kiếm theo name nếu có
    if (name) {
      queryBuilder.where('role.name LIKE :name', { name: `%${name}%` });
    }

    // Tính toán offset và limit cho phân trang
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit) // Offset
      .take(limit)
      .orderBy('role.createdAt', 'DESC') // Limit
      .getManyAndCount(); // Trả về cả dữ liệu và tổng số bản ghi

    return { data, total };
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async delete(id: number): Promise<Role> {
    const role = await this.findOne(id);
    return await this.roleRepository.remove(role);
  }

  async assignPermissionsToRole(
    roleId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ): Promise<Role> {
    const { permissionIds } = assignPermissionsDto;
    const role = await this.findOne(roleId);

    const permissions =
      await this.permissionRepository.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }
}
