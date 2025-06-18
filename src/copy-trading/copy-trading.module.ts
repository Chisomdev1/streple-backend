// src/copy-trading/copy-trading.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CopyWallet } from './entities/copy-wallet.entity';
import { ProSignal } from './entities/pro-signal.entity';
import { User } from '../users/user.entity';
import { CopyTrade } from './entities/copy-trade.entity';
import { CopyTradingService } from './copy-trading.service';
import { CopyTradingController } from './copy-trading.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CopyWallet, ProSignal, CopyTrade, User]),
        UsersModule,
    ],
    controllers: [CopyTradingController],
    providers: [CopyTradingService],
})
export class CopyTradingModule { }
