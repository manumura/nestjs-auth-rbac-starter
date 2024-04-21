import { Exclude, Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.model';
import { UUID } from 'crypto';

@Exclude()
export class AuthenticatedUserModel {
  @Expose()
  @ApiProperty()
  public readonly id: number;

  @Expose()
  @ApiProperty()
  public readonly uuid: UUID;

  @Expose()
  @ApiProperty()
  public email: string;

  public password: string;

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
}
