import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../users/entities/user.entity';

export class SignupResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'usuario@correo.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.REGULAR })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(user: User): SignupResponseDto {
    const dto = new SignupResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    return dto;
  }
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}

export class MeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'usuario@correo.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.REGULAR })
  role: UserRole;

  static fromEntity(user: User): MeResponseDto {
    const dto = new MeResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.role = user.role;
    return dto;
  }
}
