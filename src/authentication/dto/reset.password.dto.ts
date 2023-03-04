import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsResetPasswordTokenValid } from '../validation/IsResetPasswordTokenValid';

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  public password: string;

  @IsResetPasswordTokenValid({
    message: 'User not found, or token already expired',
  })
  @IsString()
  public token: string;
}
