import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserWithRole } from '../../../prisma/custom-types';
import { Role } from '../model/role.model';
import { UserModel } from '../model/user.model';

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
}
