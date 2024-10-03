import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../modules/user/user.entity';
import { UserService } from '../../modules/user/user.service';
import { UserType } from '../user/user.dto';
import { Not } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(code: string, pass: string): Promise<any> {
    const user = await this.userService.findByCode(code);

    if (user && user.password && pass == user.password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    }

    return null;
  }

  login(user: User, loginType: UserType) {
    const { id, type, active } = user;
    const payload = { sub: id };
    if (type != loginType) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    if (!active) {
      throw new NotFoundException('Your account is not active');
    }

    delete user['password'];

    return {
      message: 'Login successfully',
      data: {
        user,
        accessToken: this.jwtService.sign(payload),
      },
    };
  }
}
