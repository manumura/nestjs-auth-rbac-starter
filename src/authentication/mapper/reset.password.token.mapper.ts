import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordToken } from '../../prisma/generated/client.js';
import { ResetPasswordTokenModel } from '../model/reset.password.token.model.js';

@Injectable()
export class ResetPasswordTokenMapper {
  public entityToModel(entity: ResetPasswordToken): ResetPasswordTokenModel {
    const model = plainToInstance(ResetPasswordTokenModel, entity);
    return model;
  }
}
