import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { OauthProviderModel } from './oauth.provider.model';
import { Role } from './role.model';

@Exclude()
export class UserModel {
  @Expose()
  @ApiProperty()
  public readonly uuid: string;

  @Expose()
  @ApiProperty()
  public name: string;

  @Expose()
  @ApiProperty()
  public isActive: boolean;

  @Expose()
  @ApiProperty()
  public imageId: string;

  @Expose()
  @ApiProperty()
  public imageUrl: string;

  @Expose()
  @ApiProperty({ enum: Role })
  public role: Role;

  @Expose()
  @ApiProperty()
  public createdAt: Date;

  @Expose()
  @ApiProperty()
  public updatedAt: Date;

  @Expose()
  @ApiProperty()
  public email?: string;

  @Expose()
  @ApiProperty()
  @Type(() => OauthProviderModel)
  public providers: OauthProviderModel[];
}
