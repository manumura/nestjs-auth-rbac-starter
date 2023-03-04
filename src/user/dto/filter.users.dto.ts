import { LanguageCode } from '../model/language-code.model';
import { Role } from '../model/role.model';

export class FilterUsersDto {
  active?: boolean;
  role?: Role;
  langCode?: LanguageCode;
  emails?: string[];
}
