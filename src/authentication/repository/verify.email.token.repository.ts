import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class VerifyEmailTokenRepository {
  private readonly logger = new Logger('VerifyEmailTokenRepository');

  constructor(private readonly prisma: PrismaService) {}

  async updateIsEmailVerified(userId: number, token: string): Promise<void> {
    // Transaction : update user + delete token
    await this.prisma.$transaction(async (tx) => {
      this.logger.debug('Begin transaction: update user password');
      await tx.userCredentials.update({
        where: {
          userId,
        },
        data: {
          isEmailVerified: true,
        },
      });

      this.logger.debug('Delete verify email token by token');
      await tx.verifyEmailToken.delete({
        where: {
          token,
        },
      });
      this.logger.debug('End transaction');
    });
  }
}
