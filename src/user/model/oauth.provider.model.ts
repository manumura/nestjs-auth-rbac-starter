import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { OauthProvider } from './provider.model';

@Exclude()
export class OauthProviderModel {
  @Expose()
  @ApiProperty()
  public externalUserId: string;

  @Expose()
  @ApiProperty({ enum: OauthProvider })
  public provider: OauthProvider;

  @Expose()
  @ApiProperty()
  public email?: string | null;
}
