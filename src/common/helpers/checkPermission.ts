import { ForbiddenException } from '@nestjs/common';
import { UserType } from 'src/modules/user/user.dto';
import { User } from 'src/modules/user/user.entity';

export function checkUserPermission(id: number, user: User): void {
  if (id !== user.id) {
    if (user.type !== UserType.MASTER) {
      throw new ForbiddenException(
        `You do not have permission to modify this entity`,
      );
    }
  }
}
