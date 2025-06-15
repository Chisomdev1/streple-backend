import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';

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
    return this.makeJwt(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException('Bad credentials');
    }
    return this.makeJwt(user.id);
  }

  private makeJwt(id: string) {
    return {
      access_token: this.jwt.sign({ sub: id }),
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES,
    };
  }
}
