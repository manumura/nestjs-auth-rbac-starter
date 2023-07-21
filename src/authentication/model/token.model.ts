import { ApiProperty } from '@nestjs/swagger';

export class TokenModel {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  accessTokenExpiryDate: Date;
}
