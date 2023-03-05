import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsUserEmailAlreadyExist } from '../validation/IsUserEmailAlreadyExist';

export class RegisterDto {
  @IsEmail()
  @IsUserEmailAlreadyExist({
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
