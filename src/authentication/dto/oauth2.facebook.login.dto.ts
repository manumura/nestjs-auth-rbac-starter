import { IsEmail, IsNotEmpty } from 'class-validator';

export class Oauth2FacebookLoginDto {
  @IsNotEmpty()
  public id: string;
  @IsEmail()
  public email: string;
  public name?: string;
  // public picture?: string;
}
