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
import { InitService } from '../init/init.service';
import { LoginDto } from './dtos/login.dto';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly initService: InitService,
  ) {}

  async login(dto: LoginDto, loginType: UserType) {
    const user = await this.userService.findByCode(dto.code);

    if (user && (await compare(dto.password, user.password))) {
      const { password, ...rest } = user;
      const payload = { sub: user.id };

      if (user.type != loginType) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
      if (!user.active) {
        throw new NotFoundException('Your account is not active');
      }

      return {
        message: 'Login successfully',
        data: {
          user: rest,
          accessToken: this.jwtService.sign(payload),
        },
      };
    }

    let userInfo = null;

    switch (loginType) {
      case UserType.STUDENT:
        userInfo = await this.initService.getStudentInfo(
          dto.code,
          dto.password,
        );
        break;
      case UserType.TEACHER:
        userInfo = await this.initService.getTeacherInfo(
          dto.code,
          dto.password,
        );
        break;
    }

    if (!userInfo) {
      throw new NotFoundException('Invalid code or password');
    }

    const newUser = await this.userService.create({
      ...userInfo,
      type: loginType,
    });

    const { password, ...rest } = newUser;

    const payload = { sub: newUser.id };

    return {
      message: 'Login successfully',
      data: {
        user: rest,
        accessToken: this.jwtService.sign(payload),
      },
    };
  }
}
