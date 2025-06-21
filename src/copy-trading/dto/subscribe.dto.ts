// src/copy-trading/dto/subscribe.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';
export class SubscribeDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    proTraderId: string;

    @ApiProperty({ example: 200, minimum: 1 })
    @IsNumber()
    @Min(1)
    allocate: number;   // how much to allocate
}
