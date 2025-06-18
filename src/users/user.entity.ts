import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';

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

  @Column({ default: 0 })
  followerCount: number;

  @Column({ type: 'json', nullable: true })
  performanceHistory: Array<{ date: string; value: number }>;

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
