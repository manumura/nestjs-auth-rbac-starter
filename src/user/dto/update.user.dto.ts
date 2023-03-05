import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../model/role.model';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  public email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  public password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  public name?: string;

  @IsOptional()
  @IsBoolean()
  public active?: boolean;

  @IsOptional()
  @IsEnum(Role, {
    message: 'Role is empty or invalid',
  })
  public role?: Role;
}
