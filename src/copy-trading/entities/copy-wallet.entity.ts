import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class CopyWallet {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (u) => u.copyWallets) user: User;

  @Column() proTraderId: string; // foreign key shortcut

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  balance: number; // funds allocated

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
