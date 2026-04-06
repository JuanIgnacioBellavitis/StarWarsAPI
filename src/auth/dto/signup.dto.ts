import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(8)
  password: string;
}
