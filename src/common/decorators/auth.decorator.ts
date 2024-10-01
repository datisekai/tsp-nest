import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ACGuard, Role } from 'nest-access-control';
import { JwtAuthGuard } from '../../modules/auth/guards';

export function Auth(...roles: Role[]) {
  console.log('---auth decorator---', roles);
  return applyDecorators(UseGuards(JwtAuthGuard, ACGuard), ApiBearerAuth());
}
