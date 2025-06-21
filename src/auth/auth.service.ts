import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { Role } from 'src/users/enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) { }

  async register(dto: CreateUserDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const user = await this.users.create(dto);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.makeJwt(payload);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException('Bad credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.makeJwt(payload);
  }

  private makeJwt(payload: JwtPayload) {
    return {
      access_token: this.jwt.sign(payload),
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES,
    };
  }
}
