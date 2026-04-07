import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginResponseDto, SignupResponseDto } from './dto/auth-response.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  const usersServiceMock = {
    createRegularUser: jest.fn(),
    findByEmail: jest.fn(),
  } as unknown as UsersService;

  const jwtServiceMock = {
    signAsync: jest.fn(),
  } as unknown as JwtService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(usersServiceMock, jwtServiceMock);
  });

  describe('signup', () => {
    it('creates a regular user and returns safe fields', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (usersServiceMock.createRegularUser as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@mail.com',
        role: UserRole.REGULAR,
        createdAt: new Date('2026-01-01'),
      });

      const response = await authService.signup({
        email: '  TEST@mail.com ',
        password: 'StrongPass123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPass123', 10);
      expect(usersServiceMock.createRegularUser).toHaveBeenCalledWith(
        'test@mail.com',
        'hashed-password',
      );
      expect(response).toBeInstanceOf(SignupResponseDto);
      expect(response).toEqual(
        expect.objectContaining({
          id: 'user-id',
          email: 'test@mail.com',
          role: UserRole.REGULAR,
          createdAt: new Date('2026-01-01'),
        }),
      );
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user does not exist', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'missing@mail.com', password: 'StrongPass123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@mail.com',
        role: UserRole.REGULAR,
        passwordHash: 'stored-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@mail.com', password: 'WrongPass123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns access token when credentials are valid', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@mail.com',
        role: UserRole.ADMIN,
        passwordHash: 'stored-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('jwt-token');

      const response = await authService.login({
        email: ' TEST@mail.com ',
        password: 'StrongPass123',
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('test@mail.com');
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'test@mail.com',
        role: UserRole.ADMIN,
      });
      expect(response).toBeInstanceOf(LoginResponseDto);
      expect(response).toEqual(expect.objectContaining({ accessToken: 'jwt-token' }));
    });
  });
});
