import { ApiProperty } from '@nestjs/swagger';

export class MessageModel {
  @ApiProperty()
  message: string;
}
