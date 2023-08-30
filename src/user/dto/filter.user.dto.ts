import { UUID } from 'crypto';

export class FilterUserDto {
  active?: boolean;
  id?: number;
  uuid?: UUID;
  email?: string;
}
