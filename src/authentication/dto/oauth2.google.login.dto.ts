import { IsNotEmpty } from 'class-validator';

export class Oauth2GoogleLoginDto {
  @IsNotEmpty()
  public token: string;
}
