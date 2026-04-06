import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let repositoryMock: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    repositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    usersService = new UsersService(repositoryMock as unknown as Repository<User>);
  });

  it('findByEmail queries repository by email', async () => {
    const user = { id: '1', email: 'user@mail.com' } as User;
    repositoryMock.findOne.mockResolvedValue(user);

    const result = await usersService.findByEmail('user@mail.com');

    expect(repositoryMock.findOne).toHaveBeenCalledWith({ where: { email: 'user@mail.com' } });
    expect(result).toEqual(user);
  });

  it('findById queries repository by id', async () => {
    const user = { id: '1', email: 'user@mail.com' } as User;
    repositoryMock.findOne.mockResolvedValue(user);

    const result = await usersService.findById('1');

    expect(repositoryMock.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(user);
  });

  it('createRegularUser throws ConflictException when email already exists', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 'existing-id' } as User);

    await expect(
      usersService.createRegularUser('user@mail.com', 'hash-value'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('createRegularUser creates and saves user with REGULAR role', async () => {
    repositoryMock.findOne.mockResolvedValue(null);
    const created = {
      email: 'new@mail.com',
      passwordHash: 'hash-value',
      role: UserRole.REGULAR,
    } as User;
    const saved = { id: 'new-id', ...created } as User;

    repositoryMock.create.mockReturnValue(created);
    repositoryMock.save.mockResolvedValue(saved);

    const result = await usersService.createRegularUser('new@mail.com', 'hash-value');

    expect(repositoryMock.create).toHaveBeenCalledWith({
      email: 'new@mail.com',
      passwordHash: 'hash-value',
      role: UserRole.REGULAR,
    });
    expect(repositoryMock.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(saved);
  });
});
