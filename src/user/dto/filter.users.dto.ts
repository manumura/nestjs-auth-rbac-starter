import { LanguageCode } from '../model/language-code.model.js';
import { Role } from '../model/role.model.js';

export class FilterUsersDto {
  active?: boolean;
  role?: Role;
  langCode?: LanguageCode;
  emails?: string[];
}
