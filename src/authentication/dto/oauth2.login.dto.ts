import { IsNotEmpty } from 'class-validator';

export class Oauth2LoginDto {
  @IsNotEmpty()
  public token: string;
}
