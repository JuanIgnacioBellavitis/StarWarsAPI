import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflectorMock: { getAllAndOverride: jest.Mock };

  const buildContext = (user?: { role: UserRole }) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as never;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };
    rolesGuard = new RolesGuard(reflectorMock as unknown as Reflector);
  });

  it('allows request when endpoint has no role metadata', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);

    const result = rolesGuard.canActivate(buildContext());
    expect(result).toBe(true);
  });

  it('throws when endpoint requires role and there is no authenticated user', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => rolesGuard.canActivate(buildContext())).toThrow(ForbiddenException);
  });

  it('throws when authenticated user does not have required role', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => rolesGuard.canActivate(buildContext({ role: UserRole.REGULAR }))).toThrow(
      ForbiddenException,
    );
  });

  it('allows when authenticated user has one required role', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.REGULAR]);

    const result = rolesGuard.canActivate(buildContext({ role: UserRole.REGULAR }));
    expect(result).toBe(true);
  });
});
