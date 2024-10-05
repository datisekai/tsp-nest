import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from '../role/role.entity';
import {
  CreatePermissionDto,
  QueryPermissionDto,
  UpdatePermissionDto,
} from './permission.dto';
import { User } from '../user/user.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly userRepository: Repository<User>,
  ) {}

  async hasPermissions(
    userWithRole: User,
    requiredPermissions: string[],
  ): Promise<boolean> {
    if (!userWithRole || !userWithRole.role) {
      return false;
    }

    const userPermissions =
      userWithRole?.role?.permissions.map(
        (perm) => `${perm.resource}:${perm.action}`,
      ) || [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }

  async findAll(queryDto: QueryPermissionDto): Promise<Permission[]> {
    const { action, resource, roleId } = queryDto;

    const queryBuilder =
      this.permissionRepository.createQueryBuilder('permission');

    if (action) {
      queryBuilder.andWhere('permission.action LIKE :action', {
        action: `%${action}%`,
      });
    }

    if (resource) {
      queryBuilder.andWhere('permission.resource LIKE :resource', {
        resource: `%${resource}%`,
      });
    }

    if (roleId) {
      queryBuilder
        .innerJoin('permission.roles', 'role')
        .andWhere('role.id = :roleId', { roleId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'], // Fetch associated roles
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async delete(id: number): Promise<Permission> {
    const permission = await this.findOne(id);
    return this.permissionRepository.remove(permission);
  }
}
