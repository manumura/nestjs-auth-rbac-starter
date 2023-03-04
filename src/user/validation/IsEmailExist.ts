import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { FilterUserDto } from '../dto/filter.user.dto';
import { UserRepository } from '../repository/user.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailExistConstraint implements ValidatorConstraintInterface {
  private logger = new Logger('IsEmailExistAndUserNotDeletedConstraint');

  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async validate(userEmail: string, args: ValidationArguments): Promise<boolean> {
    this.logger.debug(`Checking email not existing for not deleted user: ${userEmail}`);
    try {
      const filter: FilterUserDto = {
        email: userEmail,
      };
      const user = await this.userRepository.findOne(filter);
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

export function IsEmailExist(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailExistConstraint,
    });
  };
}
