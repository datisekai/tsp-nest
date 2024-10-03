import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'code', // 'username'
      passwordField: 'password', // 'passport'
    });
  }

  async validate(code: string, password: string) {
    const user = await this.authService.validateUser(code, password);
    if (!user)
      throw new UnauthorizedException('Login code or password does not match.');
    return user;
  }
}
