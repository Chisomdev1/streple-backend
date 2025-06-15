import {
  Controller, Get, Patch, Body, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ToggleRoleDto } from './dto/toggle-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('toggle-role')
  toggle(@Req() req: Request, @Body() dto: ToggleRoleDto) {
    return this.users.toggleRole((req.user as any).id, dto);
  }
}
