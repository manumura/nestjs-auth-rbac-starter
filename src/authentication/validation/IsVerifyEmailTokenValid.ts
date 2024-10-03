import { Injectable, Logger } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserService } from '../../user/service/user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsVerifyEmailTokenValidConstraint implements ValidatorConstraintInterface {
  private readonly logger = new Logger('IsVerifyEmailTokenValidConstraint');

  constructor(private readonly userService: UserService) {}

  async validate(token: string, args: ValidationArguments): Promise<boolean> {
    this.logger.debug(`Find user by token: ${token} and expiry date`);
    try {
      const user = await this.userService.findByValidVerifyEmailToken(token);
      const isValid = !!user;
      this.logger.debug(`Is valid? ${isValid}`);
      return isValid;
    } catch (error) {
      this.logger.debug('Is valid? false');
      return false;
    }
  }
}

export function IsVerifyEmailTokenValid(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsVerifyEmailTokenValidConstraint,
    });
  };
}
