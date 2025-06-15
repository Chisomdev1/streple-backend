import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

export default (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,   // ✅ auto‑sync for dev; switch off in prod!
});
