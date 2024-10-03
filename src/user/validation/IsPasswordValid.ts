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
      { regex: /.{8,}/ }, // min 8 letters,
      { regex: /\d/ }, // numbers from 0 - 9
      { regex: /[a-z]/ }, // letters from a - z (lowercase)
      { regex: /[A-Z]/ }, // letters from A-Z (uppercase),
      { regex: /[^A-Za-z0-9]/ }, // special characters
    ];

    let isValid = true;
    for (const rule of rules) {
      isValid = rule.regex.test(password);
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
