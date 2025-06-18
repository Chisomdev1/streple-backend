// src/copy-trading/dto/signal.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber } from 'class-validator';
export class SignalDto {
    @ApiProperty({ example: 'BTCUSDT' })
    @IsString() symbol: string;

    @ApiProperty({ enum: ['buy', 'sell'] })
    @IsEnum(['buy', 'sell']) direction: 'buy' | 'sell';

    @ApiProperty({ example: 0.1 })
    @IsNumber() amount: number;

    @ApiProperty({ example: 58000 })
    @IsNumber() stopLoss: number;

    @ApiProperty({ example: 62000 })
    @IsNumber() takeProfit: number;
}
