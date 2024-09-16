import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserWithRole, UserWithRoleCredentialsAndOauthProviders } from '../../../prisma/custom-types';
import { AuthenticatedUserModel } from '../model/authenticated.user.model';
import { Role } from '../model/role.model';
import { UserModel } from '../model/user.model';
import { OauthProvider } from '../model/provider.model';

@Injectable()
export class UserMapper {
  // TODO delete
  // public entitiesToModels(entities: UserWithRole[]): UserModel[] {
  //   if (!entities) {
  //     return [];
  //   }
  //   const models = entities.filter((entity) => !!entity).map((entity) => this.entityToModel(entity));
  //   return models;
  // }

  // public entityToModel(entity: UserWithRole): UserModel {
  //   const model = plainToInstance(UserModel, entity);
  //   model.role = Role[entity.role?.name];
  //   return model;
  // }

  public entityToAuthenticatedUserModel(entity: UserWithRole): AuthenticatedUserModel {
    const model = plainToInstance(AuthenticatedUserModel, entity);
    model.role = Role[entity.role?.name];
    return model;
  }

  public entityToModel(entity: UserWithRoleCredentialsAndOauthProviders): UserModel {
    const model = plainToInstance(UserModel, entity);
    model.role = Role[entity.role?.name];
    model.email = entity.credentials?.email;
    const providers = entity.oauthProviders.map((provider) => {
      return {
        externalUserId: provider.externalUserId,
        provider: provider.oauthProvider.name as OauthProvider,
        email: provider.email,
      };
    });
    model.providers = providers;
    return model;
  }

  public entitiesToModels(entities: UserWithRoleCredentialsAndOauthProviders[]): UserModel[] {
    if (!entities) {
      return [];
    }
    const models = entities.filter((entity) => !!entity).map((entity) => this.entityToModel(entity));
    return models;
  }
}
