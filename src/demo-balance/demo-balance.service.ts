import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DemoBalance } from './demo-balance.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import * as dayjs from 'dayjs';

@Injectable()
export class DemoBalanceService {
  constructor(
    @InjectRepository(DemoBalance)
    private readonly balanceRepo: Repository<DemoBalance>,

    private readonly usersService: UsersService,
  ) {}

  async requestDemoBalance(user: User): Promise<DemoBalance> {
    let balance = await this.balanceRepo.findOne({ where: { user } });

    if (!balance) {
      balance = this.balanceRepo.create({
        user,
        balance: 500,
        lastTopUp: new Date(),
      });
    } else {
      balance.balance += 500;
      balance.lastTopUp = new Date();
    }

    // ✅ Sync user's demoFundingBalance
    user.demoFundingBalance = balance.balance;
    await this.usersService.save(user);

    return this.balanceRepo.save(balance);
  }

  async getBalance(user: User): Promise<DemoBalance> {
    let balance = await this.balanceRepo.findOne({ where: { user } });

    if (!balance) {
      balance = this.balanceRepo.create({
        user,
        balance: 0,
        lastTopUp: null,
      });

      await this.balanceRepo.save(balance);
    }

    return balance;
  }

  async deduct(user: User, amount: number): Promise<void> {
    const balance = await this.getBalance(user);

    if (!balance || balance.balance < amount) {
      throw new BadRequestException('Insufficient demo funds.');
    }

    balance.balance -= amount;
    await this.balanceRepo.save(balance);
  }

  async topUp(user: User): Promise<DemoBalance> {
    const balance = await this.getBalance(user);

    if (!balance) throw new BadRequestException('No demo balance found.');

    balance.balance = 500;
    balance.lastTopUp = new Date();

    // ✅ Corrected: use `balance`, not `demoBalance`
    await this.usersService.update(user.id, {
      demoFundingBalance: balance.balance,
    });

    return this.balanceRepo.save(balance);
  }
}
