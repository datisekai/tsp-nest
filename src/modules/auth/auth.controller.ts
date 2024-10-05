import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../../common/decorators';
import { User as UserEntity } from '../../modules/user/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard, LocalAuthGuard } from './guards';
import { AppResource } from '../../app.role';
import { UserType } from '../user/user.dto';

@ApiTags(AppResource.AUTH)
@Controller('api.auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-student')
  @ApiOperation({
    summary: 'Login student',
  })
  async loginStudent(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, UserType.STUDENT);
  }

  @Post('login-teacher')
  @ApiOperation({
    summary: 'Login student',
  })
  async loginTeacher(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, UserType.TEACHER);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'Get My Profile',
  })
  profile(@User() user: UserEntity) {
    return {
      message: 'Get Profile successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-token')
  async checkToken() {
    return { data: true };
  }
}
