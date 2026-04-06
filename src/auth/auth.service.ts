import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';

type SignupResponse = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(signupDto: SignupDto): Promise<SignupResponse> {
    const passwordHash = await bcrypt.hash(signupDto.password, 10);
    const createdUser = await this.usersService.createRegularUser(
      signupDto.email.toLowerCase().trim(),
      passwordHash,
    );

    return {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
    };
  }
}
