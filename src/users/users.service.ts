import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ToggleRoleDto } from './dto/toggle-role.dto';
import { Role } from './enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create(dto);
    user.password = await bcrypt.hash(dto.password, 10);
    return this.repo.save(user);
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    return user;
  }

  async toggleRole(id: string, dto: ToggleRoleDto) {
    const user = await this.findById(id);
    user.role = dto.role;
    return this.repo.save(user);
  }

  /* add convenience for stats updates, followers etc later */
}
