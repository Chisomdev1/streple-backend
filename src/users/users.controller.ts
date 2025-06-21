import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ToggleRoleDto } from './dto/toggle-role.dto';
import { TopUpDto } from './dto/top-up.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /* -------- basic identity -------------------------------- */
  @Get('me')
  @ApiOperation({ summary: 'Current user basic JWT payload' })
  @ApiResponse({ status: 200, description: 'Decoded JWT payload' })
  me(@Req() req: Request) {
    return req.user;
  }

  /* -------- profile page ---------------------------------- */
  @Get('profile')
  @ApiOperation({ summary: 'Full profile' })
  @ApiResponse({ status: 200, description: 'Returns detailed user profile' })
  profile(@Req() req: Request) {
    return this.users.getProfile((req.user as any).id);
  }

  /* -------- role switching -------------------------------- */
  @Patch('toggle-role')
  @ApiOperation({ summary: 'Switch between PRO_TRADER / FOLLOWER' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  toggle(@Req() req: Request, @Body() dto: ToggleRoleDto) {
    return this.users.toggleRole((req.user as any).id, dto);
  }

  /* -------- dashboard (overview) -------------------------- */
  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Returns user trading dashboard info',
  })
  dashboard(@Req() req: Request) {
    return this.users.getDashboard((req.user as any).id);
  }

  /* -------- funding account balance ----------------------- */
  @Get('demo-balance')
  @ApiOperation({ summary: 'Funding account balance' })
  @ApiResponse({ status: 200, description: 'Returns user funding balance' })
  async demoFunding(@Req() req: Request) {
    return this.users.getDemoFunding((req.user as any).id);
  }

  /* -------- top‑up funding balance (DEV / DEMO) ----------- */
  @Patch('demo-balance/top-up')
  @ApiOperation({ summary: 'Top-up funding balance (DEMO)' })
  @ApiResponse({ status: 200, description: 'Balance updated successfully' })
  async topUp(@Req() req: Request, @Body() dto: TopUpDto) {
    const user = await this.users.topUpDemoFunding((req.user as any).id, dto);
    return { ok: true, balance: user.demoFundingBalance };
  }

  /* -------- list copy wallets (per‑pro trading balances) -- */
  @Get('wallets')
  @ApiOperation({ summary: 'Per-pro copy wallets' })
  @ApiResponse({
    status: 200,
    description: 'Returns wallet balances grouped by trader',
  })
  wallets(@Req() req: Request) {
    return this.users.getCopyWallets((req.user as any).id);
  }
}
