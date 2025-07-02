import { IsEnum } from 'class-validator';
import { Role } from '../entities/user.entity';

export class UpdateRoleDto {
  @IsEnum(Role, { message: 'Role must be one of: customer, provider, admin' })
  role: Role;
}
