import { IsBoolean, IsPositive, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  email?: string;

  @IsString()
  password?: string;

  @IsString()
  name?: string;

  @IsBoolean()
  isActive?: boolean;

  @IsPositive()
  roleId?: number;
}
