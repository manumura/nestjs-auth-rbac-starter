import { Injectable, Logger } from '@nestjs/common';
import { AuthenticationToken } from '@prisma/client';
import moment from 'moment';
import { AuthenticationTokenWithUser } from '../../../prisma/custom-types';
import { PrismaService } from '../../../prisma/prisma.service';
import { appConfig } from '../../config/config';
import { encryptToSha256 } from '../../shared/util/crypto';

@Injectable()
export class AuthenticationTokenRepository {
  private logger = new Logger('AuthenticationTokenRepository');

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

  async create(accessToken: string, refreshToken: string, userId: number): Promise<AuthenticationToken | undefined> {
    const data = {
      accessToken,
      accessTokenExpireAt: this.getAccessTokenExpiryDate(),
      refreshToken,
      refreshTokenExpireAt: this.getRefreshTokenExpiryDate(),
      userId,
      createdAt: moment().utc().toDate(),
    };
    const authToken = await this.prisma.authenticationToken.create({
      data,
    });
    return authToken;
  }

  async remove(userId: number): Promise<AuthenticationToken | undefined> {
    const authToken = await this.prisma.authenticationToken.delete({
      where: {
        userId,
      },
    });
    return authToken;
  }

  async generate(accessToken: string, refreshToken: string, userId: number): Promise<AuthenticationToken | undefined> {
    // Transaction : remove existing token + create new token
    const authToken = await this.prisma.$transaction(async (tx) => {
      this.logger.debug('Begin transaction: remove existing token');
      await tx.authenticationToken.delete({
        where: {
          userId,
        },
      });

      this.logger.debug('Create new token');
      const data = {
        accessToken: encryptToSha256(accessToken),
        accessTokenExpireAt: this.getAccessTokenExpiryDate(),
        refreshToken: encryptToSha256(refreshToken),
        refreshTokenExpireAt: this.getRefreshTokenExpiryDate(),
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

  private getAccessTokenExpiryDate(): Date {
    const now = moment().utc();
    return now.add(appConfig.ACCESS_TOKEN_EXPIRES_IN_AS_SECONDS, 'seconds').toDate();
  }

  private getRefreshTokenExpiryDate(): Date {
    const now = moment().utc();
    return now.add(appConfig.REFRESH_TOKEN_EXPIRY_DURATION_IN_AS_SECONDS, 'seconds').toDate();
  }
}
