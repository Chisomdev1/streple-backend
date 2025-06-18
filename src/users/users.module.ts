import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { CopyWallet } from '../copy-trading/entities/copy-wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, CopyWallet])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
