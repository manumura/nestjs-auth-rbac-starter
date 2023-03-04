import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { FilterUserDto } from 'src/user/dto/filter.user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { appConfig } from '../../config/config';
import { EmailService } from '../../notification/email.service';
import { UserMapper } from '../../user/mapper/user.mapper';
import { UserModel } from '../../user/model/user.model';
import { UserRepository } from '../../user/repository/user.repository';
import { ForgotPasswordDto } from '../dto/forgot.password.dto';
import { ResetPasswordDto } from '../dto/reset.password.dto';
import { ResetPasswordTokenMapper } from '../mapper/reset.password.token.mapper';
import { ResetPasswordTokenModel } from '../model/reset.password.token.model';
import { ResetPasswordTokenRepository } from '../repository/reset.password.token.repository';

@Injectable()
export class ResetPasswordService {
  private logger = new Logger('ResetPasswordService');

  constructor(
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository,
    private readonly userMapper: UserMapper,
    private readonly resetPasswordTokenMapper: ResetPasswordTokenMapper,
    private readonly prisma: PrismaService,
  ) {}

  async findByValidToken(token: string): Promise<UserModel> {
    this.logger.debug(`Find user by token: ${token}`);
    if (!token) {
      throw new BadRequestException('Token undefined');
    }

    const entity = await this.userRepository.findOneByValidResetPasswordToken(token);
    if (!entity) {
      throw new NotFoundException(`User not found, or token already expired: ${token}`);
    }
    const user = this.userMapper.entityToModel(entity);
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  }

  async createToken(forgotPasswordDto: ForgotPasswordDto): Promise<ResetPasswordTokenModel> {
    const { email } = forgotPasswordDto;
    if (!email) {
      throw new BadRequestException('Email cannot be undefined');
    }

    const filterByEmail: FilterUserDto = {
      email,
    };
    const userEntity = await this.userRepository.findOne(filterByEmail);
    this.logger.debug(`User found: ${JSON.stringify(userEntity)}`);
    if (!userEntity) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const resetPasswordTokenCreated = await this.resetPasswordTokenRepository.create(userEntity.id);
    if (!resetPasswordTokenCreated) {
      throw new InternalServerErrorException('Reset password token creation failed');
    }
    const resetPasswordTokenModelCreated = this.resetPasswordTokenMapper.entityToModel(resetPasswordTokenCreated);
    this.logger.debug(`Reset password token created: ${JSON.stringify(resetPasswordTokenModelCreated)}`);

    // Send email
    this.logger.verbose(`[EMAIL][RESET_PWD] Sending email to USER: ${userEntity.email}`);
    this.emailService
      .sendResetPasswordEmail(userEntity.email, 'en', resetPasswordTokenModelCreated.token)
      .then((result) => {
        this.logger.verbose(
          `[EMAIL][RESET_PWD] Result Sending email to USER: ${JSON.stringify(
            result,
          )}`,
        );
      })
      .catch((err) => this.logger.error(err));
    return resetPasswordTokenModelCreated;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<UserModel> {
    this.logger.debug('Update user password by reset password token');
    const { token, password } = resetPasswordDto;
    if (!token || !password) {
      throw new BadRequestException('Token or password is undefined');
    }

    this.logger.debug(`Find user by token: ${token}`);
    const userEntity = await this.userRepository.findOneByValidResetPasswordToken(token);
    if (!userEntity) {
      throw new NotFoundException('User not found or token already expired');
    }
    this.logger.debug(`User found: ${JSON.stringify(userEntity)}`);

    const hashedPassword = await bcrypt.hash(password, appConfig.SALT_ROUNDS);

    try {
      // Transaction : update user + delete reset password token
      const user = await this.prisma.$transaction(async (tx) => {
        this.logger.debug('Begin transaction: update user password');
        const { role, ...userEntityToUpdate } = userEntity;
        userEntityToUpdate.password = hashedPassword;
        const updatedUserEntity = await tx.user.update({
          where: {
            id: userEntity.id,
          },
          data: userEntityToUpdate,
          include: {
            role: true,
          },
        });
        this.logger.debug('Delete reset password token by token');
        await tx.resetPasswordToken.delete({
          where: {
            token,
          },
        });
        this.logger.debug('End transaction');
        const user = this.userMapper.entityToModel(updatedUserEntity);
        return user;
      });

      this.logger.debug(`Reset password success: user updated ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to reset password with token ${JSON.stringify(resetPasswordDto)}`, error.stack);
      throw new InternalServerErrorException();
    }
  }
}
