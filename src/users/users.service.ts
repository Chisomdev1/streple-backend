import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ToggleRoleDto } from './dto/toggle-role.dto';
import { TopUpDto } from './dto/top-up.dto';
import { CopyWallet } from '../copy-trading/entities/copy-wallet.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(CopyWallet)
    private readonly wallets: Repository<CopyWallet>,
  ) {}

  /* ---------------- registration / lookup ------------------ */
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

  /* ---------------- role toggle ---------------------------- */
  async toggleRole(id: string, dto: ToggleRoleDto) {
    const user = await this.findById(id);
    user.role = dto.role;
    return this.repo.save(user);
  }

  async getProfile(userId: string) {
    const user = await this.repo.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'fullName',
        'bio',
        'avatarUrl',
        'stats',
        'followerCount',
        'performanceHistory',
        'role',
        'createdAt',
      ],
    });

    if (!user) throw new NotFoundException();
    return user;
  }

  /* ---------------- dashboard ------------------------------ */
  async getDashboard(id: string) {
    const user = await this.findById(id);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      stats: user.stats,
      followerCount: user.followerCount,
      performanceHistory: user.performanceHistory,
      demoFundingBalance: user.demoFundingBalance,
      createdAt: user.createdAt,
    };
  }

  /* ---------------- demo funding getter -------------------- */
  async getDemoFunding(id: string) {
    const user = await this.findById(id);
    return {
      demoFundingBalance: user.demoFundingBalance,
    };
  }

  /* ---------------- demo funding top-up -------------------- */
  async topUpDemoFunding(id: string, dto: TopUpDto) {
    const amt = Number(dto.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }

    const user = await this.findById(id);
    user.demoFundingBalance = Number(user.demoFundingBalance) + amt;
    return this.repo.save(user);
  }

  /* ---------------- wallet tracking ------------------------ */
  async getCopyWallets(userId: string) {
    return this.wallets.find({
      where: { user: { id: userId } },
      relations: ['proTrader'],
    });
  }

  /* add convenience for stats updates, followers etc later */
}
