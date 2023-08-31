import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserWithRole } from '../../../prisma/custom-types';
import { Role } from '../model/role.model';
import { UserModel } from '../model/user.model';
import { AuthenticatedUserModel } from '../model/authenticated.user.model';

@Injectable()
export class UserMapper {

  public entitiesToModels(entities: UserWithRole[]): UserModel[] {
    if (!entities) {
      return [];
    }
    const models = entities.filter((entity) => !!entity).map((entity) => this.entityToModel(entity));
    return models;
  }

  public entityToModel(entity: UserWithRole): UserModel {
    const model = plainToInstance(UserModel, entity);
    model.role = Role[entity.role?.name];
    return model;
  }

  public entityToAuthenticatedUserModel(entity: UserWithRole): AuthenticatedUserModel {
    const model = plainToInstance(AuthenticatedUserModel, entity);
    model.role = Role[entity.role?.name];
    return model;
  }

  public authenticatedUserModelToUserModel(model: AuthenticatedUserModel): UserModel {
    const user = plainToInstance(UserModel, model);
    return user;
  }
}
