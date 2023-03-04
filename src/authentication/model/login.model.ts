import { ApiProperty } from '@nestjs/swagger';
import { UserModel } from '../../user/model/user.model';

export class LoginModel {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: UserModel;
}
