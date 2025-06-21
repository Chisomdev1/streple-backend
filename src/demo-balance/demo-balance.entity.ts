import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class DemoBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.demoBalance, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn() // Required for owning side of OneToOne
  user: User;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTopUp: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}  