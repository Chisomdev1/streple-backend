import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DemoBalance } from './demo-balance.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class DemoBalanceService {
  constructor(
    @InjectRepository(DemoBalance)
    private balanceRepo: Repository<DemoBalance>,
  ) { }

  async requestDemoBalance(user: User): Promise<DemoBalance> {
    let balance = await this.balanceRepo.findOne({ where: { user } });

    if (!balance) {
      balance = this.balanceRepo.create({
        user,
        balance: 500,
        lastTopUp: new Date(),
      });
    } else {
      // Optional cooldown logic (uncomment to activate):
      // const oneWeekAgo = dayjs().subtract(7, 'days');
      // if (balance.lastTopUp && dayjs(balance.lastTopUp).isAfter(oneWeekAgo)) {
      //   throw new BadRequestException(
      //     'Demo balance can only be requested once per week.',
      //   );
      // }

      balance.balance += 500; // Increment instead of reset
      balance.lastTopUp = new Date();
    }

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

      // Optionally save it to DB so it's persisted
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

    return this.balanceRepo.save(balance);
  }
}
