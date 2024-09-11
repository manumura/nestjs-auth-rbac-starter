import { IsNotEmpty } from 'class-validator';

export class GoogleOauth2LoginDto {
  @IsNotEmpty()
  public token: string;
}
