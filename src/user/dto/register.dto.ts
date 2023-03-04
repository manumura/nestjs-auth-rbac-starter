import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsEmailExist } from '../validation/IsEmailExist';

export class RegisterDto {
  @IsEmail()
  @IsEmailExist({
    message: 'User email $value already exists',
  })
  public email: string;

  @IsString()
  @MaxLength(100)
  public name: string;

  @IsString()
  @MinLength(8)
  public password: string;
}
