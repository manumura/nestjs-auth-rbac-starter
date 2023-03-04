import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class ResetPasswordTokenModel {
  @Expose()
  @ApiProperty()
  public token: string;

  @Expose()
  @ApiProperty()
  public expireAt: Date;
}
