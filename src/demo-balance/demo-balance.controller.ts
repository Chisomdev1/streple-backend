import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { DemoBalanceService } from './demo-balance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request'; // ✅

@Controller('demo-balance')
@UseGuards(JwtAuthGuard)
export class DemoBalanceController {
  constructor(private readonly demoBalanceService: DemoBalanceService) { }
  @Post('request')
  async requestDemo(@Req() req: AuthenticatedRequest) {
    return this.demoBalanceService.requestDemoBalance(req.user);
  }
  @Post('top-up')
  async topUp(@Req() req: AuthenticatedRequest) {
    return this.demoBalanceService.topUp(req.user);
  }
  @Get()
  async getBalance(@Req() req: AuthenticatedRequest) {
    return this.demoBalanceService.getBalance(req.user);
  }
  @Get('ping')
  ping() {
    return { message: 'pong' };
  }


}
