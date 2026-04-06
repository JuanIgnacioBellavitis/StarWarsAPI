import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new regular user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}
