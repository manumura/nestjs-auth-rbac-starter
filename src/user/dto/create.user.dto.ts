import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role } from '../model/role.model';
import { IsUserEmailAlreadyExist } from '../validation/IsUserEmailAlreadyExist';

export class CreateUserDto {
  @IsEmail()
  @IsUserEmailAlreadyExist({
    message: 'User with email $value already exists',
  })
  public email: string;

  @IsOptional()
  @IsString()
  // @MinLength(2)
  @MaxLength(100)
  public name: string;

  @IsEnum(Role, {
    message: 'Role is empty or invalid',
  })
  public role: Role;
}
