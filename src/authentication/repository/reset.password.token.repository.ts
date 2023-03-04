import { Injectable } from '@nestjs/common';
import { ResetPasswordToken } from '@prisma/client';
import moment from 'moment';
import { appConfig } from '../../config/config';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ResetPasswordTokenRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: number): Promise<ResetPasswordToken> {
    return this.prisma.resetPasswordToken.create({
      data:  {
        userId,
        token: uuidv4(),
        expiredAt: this.getExpiryDate(),
        createdAt: moment().utc().toDate(),
      },
    });
  }

  private getExpiryDate(): Date {
    const now = moment().utc();
    const expiry = appConfig.RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS ? appConfig.RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS : 24;
    return now.add(expiry, 'hours').toDate();
  }
}
