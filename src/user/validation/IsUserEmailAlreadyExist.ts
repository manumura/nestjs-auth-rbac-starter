import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserService } from '../service/user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUserEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
  private logger = new Logger('IsUserEmailAlreadyExistConstraint');

  constructor(private readonly userService: UserService) {}

  async validate(userEmail: string, args: ValidationArguments): Promise<boolean> {
    this.logger.debug(`Checking email not existing: ${userEmail}`);
    try {
      const user = await this.userService.findByEmail(userEmail);
      this.logger.debug(`User found with email ${userEmail}: ${JSON.stringify(user)}`);
      const isValid = !user;
      this.logger.debug(`${userEmail} is valid? ${isValid}`);
      return isValid;
    } catch (error) {
      this.logger.error(`Error while fetching user: ${error}`);
      const isValid = error instanceof NotFoundException;
      this.logger.debug(`${userEmail} is valid? ${isValid}`);
      return isValid;
    }
  }
}

export function IsUserEmailAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserEmailAlreadyExistConstraint,
    });
  };
}
