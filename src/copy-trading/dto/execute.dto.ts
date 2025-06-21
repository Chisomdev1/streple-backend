// src/copy-trading/dto/execute.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class ExecuteDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID() signalId: string;
}
