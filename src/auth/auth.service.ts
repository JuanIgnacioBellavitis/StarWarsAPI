import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginResponseDto, SignupResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<SignupResponseDto> {
    const passwordHash = await bcrypt.hash(signupDto.password, 10);
    const createdUser = await this.usersService.createRegularUser(
      signupDto.email.toLowerCase().trim(),
      passwordHash,
    );

    return SignupResponseDto.fromEntity(createdUser);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const email = loginDto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const dto = new LoginResponseDto();
    dto.accessToken = accessToken;
    return dto;
  }
}
