import { Injectable, Logger } from '@nestjs/common';
import { ResetPasswordToken } from '@prisma/client';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../../prisma/prisma.service';
import { appConfig } from '../../config/config';

@Injectable()
export class ResetPasswordTokenRepository {
  private logger = new Logger('ResetPasswordTokenRepository');

  constructor(private readonly prisma: PrismaService) {}

  async generate(userId: number): Promise<ResetPasswordToken> {
    // Transaction : remove existing token + create new token
    // https://github.com/prisma/prisma/issues/4072
    const token = await this.prisma.$transaction(async (tx) => {
      this.logger.debug('Begin transaction: remove existing token');
      await tx.resetPasswordToken
        .delete({
          where: {
            userId,
          },
        })
        .catch((err) => this.logger.error(err));

      this.logger.debug('Create new token');
      const data = {
        userId,
        token: uuidv4(),
        expiredAt: this.getExpiryDate(),
        createdAt: moment().utc().toDate(),
      };
      const token = await tx.resetPasswordToken.create({
        data,
      });

      this.logger.debug('End transaction');
      return token;
    });

    return token;
  }

  private getExpiryDate(): Date {
    const now = moment().utc();
    const expiry = appConfig.RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS
      ? appConfig.RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS
      : 24;
    return now.add(expiry, 'hours').toDate();
  }
}
