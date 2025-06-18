import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';
import { CopyWallet } from '../copy-trading/entities/copy-wallet.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  /* role toggle */
  @Column({ type: 'enum', enum: Role, default: Role.FOLLOWER })
  role: Role;

  /* profile bits */
  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'json', nullable: true })
  stats: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  performanceHistory: Array<{ date: string; value: number }>;

  @Column({ default: 0 })
  followerCount: number;

  /* --- DEMO FUNDING ACCOUNT ---------------------------------- */
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  demoFundingBalance: number;

  /* --- RELATION: copy wallets per Pro Trader ----------------- */
  @OneToMany(() => CopyWallet, (w) => w.user, { cascade: true })
  copyWallets: CopyWallet[];

  /* timestamps */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /* helpers */
  async validatePassword(pw: string): Promise<boolean> {
    return bcrypt.compare(pw, this.password);
  }
}
