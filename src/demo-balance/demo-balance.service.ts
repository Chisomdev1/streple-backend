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
    user.demoFundingBalance = balance.balance;
    await this.usersService.save(user);
    await this.balanceRepo.save(balance);

    // Check if balance is low and provide recommendations
    if (balance.balance < 100) {
      throw new BadRequestException('Low balance. Please review our trading guides and educational resources to improve your trading strategy.');
    }
  }

  async topUp(user: User): Promise<DemoBalance> {
    const balance = await this.getBalance(user);

    if (!balance) throw new BadRequestException('No demo balance found.');

    // Check if user qualifies for bonus
    if (balance.balance >= 1000) {
      balance.balance += 4000; // Add bonus
      balance.lastTopUp = new Date();
      user.demoFundingBalance = balance.balance;
      await this.usersService.save(user);
      return this.balanceRepo.save(balance);
    }

    balance.balance = 500;
    balance.lastTopUp = new Date();
    user.demoFundingBalance = balance.balance;
    await this.usersService.save(user);

    return this.balanceRepo.save(balance);
  }
}
