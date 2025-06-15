import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.includes(user.role);
  }
}
