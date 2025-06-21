import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
} from 'typeorm';
import { CopyWallet } from './copy-wallet.entity';

@Entity()
export class CopyTrade {
    @PrimaryGeneratedColumn('uuid') id: string;

    @ManyToOne(() => CopyWallet) wallet: CopyWallet;

    @Column() proSignalId: string;
    @Column() symbol: string;
    @Column() direction: 'buy' | 'sell';
    @Column({ type: 'decimal', precision: 18, scale: 8 }) allocatedAmt: number; // from wallet

    /** settles at close */
    @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
    profitOrLoss: number;

    @Column({ default: 'open' }) status: 'open' | 'closed';
    @CreateDateColumn() createdAt: Date;
}
