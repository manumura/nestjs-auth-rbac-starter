import { UserModel } from './user.model';
import { ApiProperty } from '@nestjs/swagger';

export class UserPageModel {
  @ApiProperty({ type: [UserModel] })
  public elements: UserModel[];

  @ApiProperty()
  public totalElements: number;
}
