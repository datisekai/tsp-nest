import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

export function ApiPermissions(...permissions: string[]) {
  return applyDecorators(
    ApiOperation({ summary: `Required Permission: ${permissions.toString()}` }),
    ApiBearerAuth(),
    ApiForbiddenResponse({
      description: `Forbidden - Requires ${permissions.toString()}`,
    }),
  );
}
