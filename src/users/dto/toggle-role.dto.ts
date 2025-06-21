// toggle-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';
export class ToggleRoleDto {
  @ApiProperty({ enum: Role, example: Role.PRO_TRADER })
  @IsEnum(Role)
  role: Role;
}
