// toggle-role.dto.ts
import { IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';
export class ToggleRoleDto {
  @IsEnum(Role) role: Role;
}