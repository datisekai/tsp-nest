import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Permission } from './permission.entity';
import { Role } from '../role/role.entity';
import {
  CreatePermissionDto,
  QueryPermissionDto,
  UpdatePermissionDto,
} from './permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async hasPermissions(
    user: User,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const userWithRole = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      relations: ['role', 'role.permissions'],
    });

    if (!userWithRole || !userWithRole.role) {
      return false;
    }

    const userPermissions = userWithRole.role.permissions.map(
      (perm) => `${perm.resource}:${perm.action}`,
    );

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
      queryBuilder.andWhere('permission.role.id = :roleId', { roleId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { roleId, ...rest } = createPermissionDto;

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const permission = this.permissionRepository.create({
      ...rest,
      role,
    });
    return this.permissionRepository.save(permission);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(id);

    const { roleId, ...rest } = updatePermissionDto;
    if (roleId) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      permission.role = role;
    }

    Object.assign(permission, rest);
    return this.permissionRepository.save(permission);
  }

  async delete(id: number): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }
}
