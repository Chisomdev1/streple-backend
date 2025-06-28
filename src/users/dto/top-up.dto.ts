import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class TopUpDto {
    @ApiProperty({ example: 500, minimum: 1 })
    @IsNumber()
    @Min(1)        
    amount: number;      
      
}