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
  private logger = new Logger('IsPasswordValidConstraint');

  validate(password: string, args: ValidationArguments): boolean {
    this.logger.debug('Password validation started');
    const regexList = [
      { regex: /.{8,}/ }, // min 8 letters,
      { regex: /[0-9]/ }, // numbers from 0 - 9
      { regex: /[a-z]/ }, // letters from a - z (lowercase)
      { regex: /[A-Z]/ }, // letters from A-Z (uppercase),
      { regex: /[^A-Za-z0-9]/ }, // special characters
    ];

    let isValid = true;
    for (const r of regexList) {
      isValid = r.regex.test(password);
      if (!isValid) {
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
