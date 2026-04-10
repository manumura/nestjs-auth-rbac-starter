import { ApiProperty } from '@nestjs/swagger';
import { UserModel } from '../../user/model/user.model.js';

export class LoginModel {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  idToken: string;

  @ApiProperty()
  accessTokenExpiresAt: Date;
}
