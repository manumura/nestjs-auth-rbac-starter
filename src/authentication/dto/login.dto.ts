import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  public password: string;

  @IsEmail()
  public email: string;
}
