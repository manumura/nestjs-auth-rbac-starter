import { Injectable, Logger } from '@nestjs/common';
import moment from 'moment';
import { AuthenticationTokenWithUser } from '../../../prisma/custom-types';
import { AuthenticationToken } from '../../../prisma/generated/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { encryptToSha256 } from '../../shared/util/crypto';

@Injectable()
export class AuthenticationTokenRepository {
  private readonly logger = new Logger('AuthenticationTokenRepository');

  constructor(private readonly prisma: PrismaService) {}

  async findByAccessToken(token: string): Promise<AuthenticationTokenWithUser | null> {
    const encryptedToken = encryptToSha256(token);
    return this.prisma.authenticationToken.findUnique({
      where: {
        accessToken: encryptedToken,
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findByRefreshToken(token: string): Promise<AuthenticationTokenWithUser | null> {
    const encryptedToken = encryptToSha256(token);
    return this.prisma.authenticationToken.findUnique({
      where: {
        refreshToken: encryptedToken,
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: number): Promise<AuthenticationTokenWithUser | null> {
    return this.prisma.authenticationToken.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async remove(userId: number): Promise<AuthenticationToken | undefined> {
    const authToken = await this.prisma.authenticationToken.delete({
      where: {
        userId,
      },
    });
    return authToken;
  }

  async generate(
    accessToken: string,
    accessTokenExpiryDate: Date,
    refreshToken: string,
    refreshokenExpiryDate: Date,
    userId: number,
  ): Promise<AuthenticationToken> {
    // Transaction : remove existing token + create new token
    // https://github.com/prisma/prisma/issues/4072
    const authToken = await this.prisma.$transaction(async (tx) => {
      this.logger.debug('Begin transaction: remove existing token');
      await tx.authenticationToken
        .delete({
          where: {
            userId,
          },
        })
        .catch((err) => this.logger.error(err));

      this.logger.debug('Create new token');
      const data = {
        accessToken: encryptToSha256(accessToken),
        accessTokenExpireAt: accessTokenExpiryDate,
        refreshToken: encryptToSha256(refreshToken),
        refreshTokenExpireAt: refreshokenExpiryDate,
        userId,
        createdAt: moment().utc().toDate(),
      };
      const authToken = await tx.authenticationToken.create({
        data,
      });

      this.logger.debug('End transaction');
      return authToken;
    });

    return authToken;
  }
}
