import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { CopyWallet } from '../copy-trading/entities/copy-wallet.entity';
import { DemoBalance } from '../demo-balance/demo-balance.entity'; // ✅ Add this import
import { CopyTrade } from '../copy-trading/entities/copy-trade.entity';
import { ProSignal } from '../copy-trading/entities/pro-signal.entity';

export default (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    User,
    CopyWallet,
    DemoBalance,
    CopyTrade,
    ProSignal,
  ],
  synchronize: true,

  ...(process.env.DB_TYPE === 'mysql' && {
    charset: 'utf8mb4',
    timezone: 'Z',
  }),
});
