import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators';
import { User as UserEntity } from 'src/modules/user/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard, LocalAuthGuard } from './guards';
import { AppResource } from 'src/app.role';

@ApiTags(AppResource.AUTH)
@Controller('api.auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login',
  })
  async login(@Body() loginDto: LoginDto, @User() user: UserEntity) {
    const data = await this.authService.login(user);
    return {
      message: 'Login successfully',
      data,
    };
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
