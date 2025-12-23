import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordToken } from '../../../prisma/generated/client';
import { ResetPasswordTokenModel } from '../model/reset.password.token.model';

@Injectable()
export class ResetPasswordTokenMapper {
  public entityToModel(entity: ResetPasswordToken): ResetPasswordTokenModel {
    const model = plainToInstance(ResetPasswordTokenModel, entity);
    return model;
  }
}
