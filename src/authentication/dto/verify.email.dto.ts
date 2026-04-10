import { IsString } from 'class-validator';
import { IsVerifyEmailTokenValid } from '../validation/IsVerifyEmailTokenValid.js';

export class VerifyEmailDto {
  @IsVerifyEmailTokenValid({
    message: 'User not found, or token already expired',
  })
  @IsString()
  public token: string;
}
