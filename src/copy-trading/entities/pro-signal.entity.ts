import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class ProSignal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* Which pro trader published this */
    @ManyToOne(() => User)
    proTrader: User;

    @Column() symbol: string;              // e.g. BTCUSDT
    @Column() direction: 'buy' | 'sell';
    @Column({ type: 'decimal', precision: 18, scale: 8 }) amount: number;       // quote size
    @Column({ type: 'decimal', precision: 18, scale: 8 }) stopLoss: number;
    @Column({ type: 'decimal', precision: 18, scale: 8 }) takeProfit: number;

    @CreateDateColumn() createdAt: Date;
}
