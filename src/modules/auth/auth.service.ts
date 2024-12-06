import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../modules/user/user.entity';
import { UserService } from '../../modules/user/user.service';
import { UserType } from '../user/user.dto';
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

    if (user && (await compare(dto.password, user.password)) && user.password) {
      const { password, ...rest } = user;
      const payload = { sub: user.id };

      // if (dto.deviceUid && user.deviceUid && user.deviceUid != dto.deviceUid) {
      //   throw new ForbiddenException(
      //     'You do not have permission to perform this action',
      //   );
      // }

      if (user.type != UserType.MASTER && user.type != loginType) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
      if (!user.active) {
        throw new NotFoundException('Your account is not active');
      }

      // if (dto.deviceUid && !user.deviceUid) {
      //   user.deviceUid = dto.deviceUid;
      //   this.userService.update(user.id, { deviceUid: dto.deviceUid });
      // }

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

    let newUser: User = {} as User;
    if (user && !user.password) {
      newUser = await this.userService.update(user.id, {
        password: userInfo.password,
        type: loginType,
        name: userInfo.name || user.name,
      });
      userInfo = { ...userInfo, ...newUser };
    } else {
      newUser = await this.userService.create({
        ...userInfo,
        type: loginType,
        roleId: 2,
      });
    }

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
