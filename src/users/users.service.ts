import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createRegularUser(email: string, passwordHash: string): Promise<User> {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const newUser = this.usersRepository.create({
      email,
      passwordHash,
      role: UserRole.REGULAR,
    });

    return this.usersRepository.save(newUser);
  }
}
