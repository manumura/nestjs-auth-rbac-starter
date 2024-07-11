import { IsNotEmpty } from 'class-validator';

export class RecaptchaDto {
  @IsNotEmpty()
  public token: string;
}
