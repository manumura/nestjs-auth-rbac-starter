import { Injectable, Logger } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserRepository } from '../repository/user.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUserEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
  private readonly logger = new Logger('IsUserEmailAlreadyExistConstraint');

  constructor(private readonly userRepository: UserRepository) {}

  async validate(userEmail: string, args: ValidationArguments): Promise<boolean> {
    this.logger.debug(`Checking email not existing: ${userEmail}`);
    const isUserEmailAlreadyExists = await this.userRepository.isUserEmailAlreadyExists(userEmail);
    this.logger.debug(`User found with email ${userEmail}: ${isUserEmailAlreadyExists}`);
    return !isUserEmailAlreadyExists;
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
