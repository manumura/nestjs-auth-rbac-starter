import { IsEmail } from 'class-validator';

export class GenerateUserPasswordDto {
  @IsEmail()
  public email: string;
}
