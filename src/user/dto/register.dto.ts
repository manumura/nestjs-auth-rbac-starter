import { IsEmail, IsString, MaxLength } from 'class-validator';
import { IsPasswordValid } from '../validation/IsPasswordValid';

export class RegisterDto {
  @IsEmail()
  // @IsUserEmailAlreadyExist({
  //   message: 'User with email $value already exists',
  // })
  public email: string;

  @IsString()
  @MaxLength(100)
  public name: string;

  @IsString()
  @IsPasswordValid({
    message:
      'Password must be at least 8 characters long, and contain at least 1 number, 1 uppercase letter, 1 lowercase letter, and 1 special character',
  })
  public password: string;
}
