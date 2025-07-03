// src/copy-trading/copy-trading.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CopyWallet } from './entities/copy-wallet.entity';
import { CopyTrade } from './entities/copy-trade.entity';
import { ProSignal } from './entities/pro-signal.entity';
import { User } from '../users/user.entity';
import { SubscribeDto } from './dto/subscribe.dto';
import { SignalDto } from './dto/signal.dto';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class CopyTradingService {
  constructor(
    @InjectRepository(CopyWallet) private wallets: Repository<CopyWallet>,
    @InjectRepository(CopyTrade) private trades: Repository<CopyTrade>,
    @InjectRepository(ProSignal) private signals: Repository<ProSignal>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  /* PRO publishes signal */
  async publishSignal(proId: string, dto: SignalDto) {
    const pro = await this.users.findOne({ where: { id: proId, role: Role.PRO_TRADER } });
    if (!pro) throw new ForbiddenException('Not a pro trader');

    const sig = this.signals.create({ ...dto, proTrader: pro });
    return this.signals.save(sig);
  }

  /* FOLLOWER subscribes & allocates funds */
  async subscribe(followerId: string, dto: SubscribeDto) {
    const follower = await this.users.findOne({ where: { id: followerId } });
    if (!follower) throw new NotFoundException();

    if (Number(follower.demoFundingBalance) < dto.allocate) {
      throw new ForbiddenException('Insufficient funding balance');
    }

    follower.demoFundingBalance -= dto.allocate;
    await this.users.save(follower);

    let wallet = await this.wallets.findOne({
      where: { user: { id: followerId }, proTraderId: dto.proTraderId },
    });

    if (!wallet) {
      wallet = this.wallets.create({
        user: follower,
        proTraderId: dto.proTraderId,
        balance: 0,
      });
    }

    wallet.balance += dto.allocate;
    return this.wallets.save(wallet);
  }

  /* Follower executes a specific signal (simplified market entry) */
  async executeSignal(followerId: string, signalId: string) {
    const sig = await this.signals.findOne({ where: { id: signalId }, relations: ['proTrader'] });
    if (!sig) throw new NotFoundException('Signal not found');

    const wallet = await this.wallets.findOne({
      where: { user: { id: followerId }, proTraderId: sig.proTrader.id },
    });

    if (!wallet) throw new ForbiddenException('Not subscribed / no wallet');

    const alloc = Number(wallet.balance); // simple 1‑shot allocation
    if (alloc <= 0) throw new BadRequestException('Wallet empty');

    wallet.balance = 0;
    await this.wallets.save(wallet);

    const ct = this.trades.create({
      wallet,
      proSignalId: sig.id,
      symbol: sig.symbol,
      direction: sig.direction,
      allocatedAmt: alloc,
      status: 'open',
    });
    return this.trades.save(ct);
  }

  /* Settles a trade (auto or manual) */
  async closeTrade(tradeId: string, exitPrice: number) {
    const trade = await this.trades.findOne({
      where: { id: tradeId },
      relations: ['wallet', 'wallet.user'],
    });

    if (!trade || trade.status === 'closed') throw new NotFoundException();

    // Naive P/L: profit = ±10%
    const pnl = trade.direction === 'buy'
      ? trade.allocatedAmt * 0.1
      : trade.allocatedAmt * -0.1;

    trade.profitOrLoss = pnl;
    trade.status = 'closed';
    await this.trades.save(trade);

    const user = trade.wallet.user;
    user.demoFundingBalance += trade.allocatedAmt + pnl;
    await this.users.save(user);

    return trade;
  }

  /* Simple market trade (follower) */
  async basicTrade(userId: string, signal: { direction: 'buy' | 'sell'; amount: number }) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (signal.direction === 'buy') {
      if (user.demoFundingBalance < signal.amount) {
        throw new BadRequestException('Insufficient balance');
      }
      user.demoFundingBalance -= signal.amount;
    } else if (signal.direction === 'sell') {
      user.demoFundingBalance += signal.amount;
    }

    return this.users.save(user);
  }

  /* Wallets for a follower */
  getFollowerWallets(followerId: string) {
    return this.wallets.find({ where: { user: { id: followerId } } });
  }

  /* Trade history for a follower */
  getFollowerTrades(followerId: string) {
    return this.trades.find({
      where: { wallet: { user: { id: followerId } } },
      order: { createdAt: 'DESC' },
    });
  }
}
