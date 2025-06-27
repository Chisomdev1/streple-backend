import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { Role } from 'src/users/enums/role.enum';
import { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';



export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,


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

  
  async verifyEmail(email: string, code: string) {
    const user = await this.userRepo.findOne({ where: { email } });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    if (user.isEmailVerified) {
      return { message: 'Email already verified' };
    }
  
    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Invalid code');
    }
  
    if (user.codeExpiresAt && user.codeExpiresAt < new Date()) {
      throw new BadRequestException('Verification code expired');
    }
  
    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.codeExpiresAt = null;
  
    await this.userRepo.save(user);
  
    return { message: 'Email verified successfully' };
  }
  
  
}
