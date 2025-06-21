import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { CopyWallet } from '../copy-trading/entities/copy-wallet.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User, CopyWallet])],
  providers: [UsersService, JwtStrategy],
  controllers: [UsersController],
  exports: [UsersService, JwtStrategy],
})
export class UsersModule {}
