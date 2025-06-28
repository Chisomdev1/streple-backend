// demo-balance.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoBalance } from './demo-balance.entity';
import { DemoBalanceService } from './demo-balance.service';
import { DemoBalanceController } from './demo-balance.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemoBalance]), // ✅ Correct
    UsersModule, // ✅ Separate module import
  ],
  providers: [DemoBalanceService],
  controllers: [DemoBalanceController],
  exports: [DemoBalanceService],
})
export class DemoBalanceModule {}
