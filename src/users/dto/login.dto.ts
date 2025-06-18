// login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'alice@streple.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd' })
  @IsString()
  password: string;
}