import { IsEmail } from 'class-validator';

import { IsUserEmailAlreadyExist } from '../validation/IsUserEmailAlreadyExist';

export class UpdateEmailDto {
  @IsEmail()
  @IsUserEmailAlreadyExist({
    message: 'User email $value already exists',
  })
  public email: string;
}
