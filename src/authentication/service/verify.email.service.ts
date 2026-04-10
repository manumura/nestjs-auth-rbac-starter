import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { UserMapper } from '../../user/mapper/user.mapper.js';
import { UserModel } from '../../user/model/user.model.js';
import { UserRepository } from '../../user/repository/user.repository.js';
import { VerifyEmailDto } from '../dto/verify.email.dto.js';
import { VerifyEmailTokenRepository } from '../repository/verify.email.token.repository.js';

@Injectable()
export class VerifyEmailService {
  private readonly logger = new Logger('VerifyEmailService');

  constructor(
    private readonly userRepository: UserRepository,
    private readonly verifyEmailTokenRepository: VerifyEmailTokenRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<UserModel> {
    this.logger.debug('Update user is verified by token');
    const { token } = verifyEmailDto;
    if (!token) {
      throw new BadRequestException('Token is undefined');
    }

    this.logger.debug(`Find user by token: ${token}`);
    const userEntity = await this.userRepository.findByValidVerifyEmailToken(token);
    if (!userEntity || !userEntity.credentials) {
      throw new NotFoundException('User not found or token already expired');
    }
    this.logger.debug(`User found: ${JSON.stringify(userEntity)}`);

    try {
      await this.verifyEmailTokenRepository.updateIsEmailVerified(userEntity.id, token);
      const user = this.userMapper.entityToModel(userEntity);
      this.logger.debug(`Verify email success: user updated ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to verify email with token ${token}`, error.stack);
      throw new InternalServerErrorException();
    }
  }
}
