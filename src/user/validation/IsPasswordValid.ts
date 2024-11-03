import { Injectable, Logger } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
@Injectable()
export class IsPasswordValidConstraint implements ValidatorConstraintInterface {
  private readonly logger = new Logger('IsPasswordValidConstraint');

  validate(password: string, args: ValidationArguments): boolean {
    this.logger.debug('Password validation started');
    const rules = [
      { regex: /^.{8,71}$/, message: 'min 8 letters and max 71 letters' }, // min 8 letters, max 71 letters (bcrypt limitation)
      { regex: /\d/, message: 'at least 1 number' }, // numbers from 0 - 9
      { regex: /[a-z]/, message: 'at least 1 lowecase letter' }, // letters from a - z (lowercase)
      { regex: /[A-Z]/, message: 'at least 1 uppercase letter' }, // letters from A-Z (uppercase),
      { regex: /[^A-Za-z0-9]/, message: 'at least 1 special character' }, // special characters
    ];

    let isValid = true;
    for (const rule of rules) {
      isValid = rule.regex.test(password);
      if (!isValid) {
        this.logger.debug(`Password is invalid: ${rule.message}`);
        break;
      }
    }

    this.logger.debug(`Password is valid ? ${isValid}`);
    return isValid;
  }
}

export function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordValidConstraint,
    });
  };
}
