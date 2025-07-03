// src/copy-trading/copy-trading.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { CopyTradingService } from './copy-trading.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { SignalDto } from './dto/signal.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { ExecuteDto } from './dto/execute.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('CopyTrading')
@ApiBearerAuth()
@Controller('copy')
@UseGuards(JwtAuthGuard)
export class CopyTradingController {
  constructor(private readonly svc: CopyTradingService) {}

  /* --- PRO: publish signal --------------------------------- */
  @Roles(Role.PRO_TRADER)
  @Post('signals')
  @ApiOperation({ summary: 'Pro trader publishes signal' })
  @ApiResponse({ status: 201, description: 'Signal published successfully' })
  publish(@Req() req: Request, @Body() dto: SignalDto) {
    return this.svc.publishSignal((req.user as any).id, dto);
  }

  /* --- FOLLOWER: subscribe & allocate ---------------------- */
  @Roles(Role.FOLLOWER)
  @Post('subscribe')
  @ApiOperation({ summary: 'Follower allocates funds to pro' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  subscribe(@Req() req: Request, @Body() dto: SubscribeDto) {
    return this.svc.subscribe((req.user as any).id, dto);
  }

  /* --- FOLLOWER: execute a signal -------------------------- */
  @Roles(Role.FOLLOWER)
  @Post('execute')
  @ApiOperation({ summary: 'Follower executes a signal' })
  @ApiResponse({ status: 201, description: 'Trade executed successfully' })
  execute(@Req() req: Request, @Body() dto: ExecuteDto) {
    return this.svc.executeSignal((req.user as any).id, dto.signalId);
  }

  /* --- FOLLOWER: view wallets & trades --------------------- */
  @Get('wallets')
  @ApiOperation({ summary: 'Follower copy wallets' })
  @ApiResponse({ status: 200, description: 'Returns copy wallet per trader' })
  wallets(@Req() req: Request) {
    return this.svc.getFollowerWallets((req.user as any).id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Follower trade history' })
  @ApiResponse({ status: 200, description: 'Returns trade history with details' })
  history(@Req() req: Request) {
    return this.svc.getFollowerTrades((req.user as any).id);
  }

  /* --- FOLLOWER: basic direct trade ------------------------ */
  @Post('trade')
  @ApiOperation({ summary: 'Execute a basic trade (buy/sell)' })
  @ApiResponse({ status: 200, description: 'Trade executed directly' })
  basicTrade(
    @Req() req: Request,
    @Body() body: { direction: 'buy' | 'sell'; amount: number },
  ) {
    return this.svc.basicTrade((req.user as any).id, body);
  }

  /* --- ADMIN or CRON: close trade (simplified) ------------- */
  @Patch('close/:tradeId')
  @ApiOperation({ summary: 'Close a trade (admin/cron/demo)' })
  @ApiResponse({ status: 200, description: 'Trade closed successfully' })
  close(@Param('tradeId') tradeId: string) {
    return this.svc.closeTrade(tradeId, 0); // exitPrice is ignored in demo
  }
}
