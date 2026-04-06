import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../common/enums/user-role.enum';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersServiceMock: { findById: jest.Mock };

  beforeEach(() => {
    usersServiceMock = {
      findById: jest.fn(),
    };

    const configServiceMock = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    jwtStrategy = new JwtStrategy(configServiceMock, usersServiceMock as unknown as UsersService);
  });

  it('returns user when payload sub exists in database', async () => {
    const user = {
      id: 'user-id',
      email: 'user@mail.com',
      role: UserRole.REGULAR,
    };
    usersServiceMock.findById.mockResolvedValue(user);

    const result = await jwtStrategy.validate({
      sub: 'user-id',
      email: 'user@mail.com',
      role: UserRole.REGULAR,
    });

    expect(usersServiceMock.findById).toHaveBeenCalledWith('user-id');
    expect(result).toEqual(user);
  });

  it('throws UnauthorizedException when payload sub is not found', async () => {
    usersServiceMock.findById.mockResolvedValue(null);

    await expect(
      jwtStrategy.validate({
        sub: 'missing-id',
        email: 'missing@mail.com',
        role: UserRole.REGULAR,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('queries database only by payload sub', async () => {
    usersServiceMock.findById.mockResolvedValue({
      id: 'abc-123',
      email: 'user@mail.com',
      role: UserRole.ADMIN,
    });

    await jwtStrategy.validate({
      sub: 'abc-123',
      email: 'other@mail.com',
      role: UserRole.REGULAR,
    });

    expect(usersServiceMock.findById).toHaveBeenCalledTimes(1);
    expect(usersServiceMock.findById).toHaveBeenCalledWith('abc-123');
  });
});
