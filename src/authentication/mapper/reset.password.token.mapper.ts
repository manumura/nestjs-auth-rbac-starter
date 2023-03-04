import { Injectable } from '@nestjs/common';
import { ResetPasswordToken } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordTokenModel } from '../model/reset.password.token.model';

@Injectable()
export class ResetPasswordTokenMapper {

  public entityToModel(entity: ResetPasswordToken): ResetPasswordTokenModel {
    const model = plainToInstance(ResetPasswordTokenModel, entity);
    return model;
  }
}
