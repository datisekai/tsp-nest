import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { UserType } from 'src/modules/user/user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'code', // 'username'
      passwordField: 'password', // 'passport'
    });
  }

  async validate(code: string, password: string, type: UserType) {
    return null;
  }
}
