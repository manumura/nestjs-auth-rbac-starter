import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import moment from 'moment';
import { UserWithRoleCredentialsAndOauthProviders } from '../../../prisma/custom-types';
import { PrismaService } from '../../../prisma/prisma.service';
import { appConfig } from '../../config/config';
import { PageModel } from '../../shared/model/page.model';
import { FilterOauthUserDto } from '../dto/filter.oauth.user.dto';
import { FilterUserDto } from '../dto/filter.user.dto';
import { GetUsersDto } from '../dto/get.users.dto';
import { UpdateUserEntityDto } from '../dto/update.user.entity.dto';

@Injectable()
export class UserRepository {
  private logger = new Logger('UserRepository');

  constructor(private readonly prisma: PrismaService) {}

  async isPasswordValid(password1: string, password2: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password1, password2);
    return isValid;
  }

  async create(
    email: string,
    name: string,
    password: string,
    roleId: number,
  ): Promise<UserWithRoleCredentialsAndOauthProviders> {
    const hashedPassword = await this.generateHashedPassword(password);
    const userEntityToCreate: Prisma.UserCreateInput = {
      name: name ?? '',
      isActive: true,
      role: {
        connect: {
          id: roleId,
        },
      },
      createdAt: moment().utc().toDate(),
      credentials: {
        create: {
          email,
          password: hashedPassword,
        },
      },
    };

    return this.prisma.user.create({
      data: userEntityToCreate,
      include: {
        role: true,
        credentials: true,
        oauthProviders: {
          select: {
            externalUserId: true,
            email: true,
            oauthProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async createOauth(
    email: string,
    name: string,
    roleId: number,
    oauthProviderId: number,
    externalUserId: string,
  ): Promise<UserWithRoleCredentialsAndOauthProviders> {
    const userEntityToCreate: Prisma.UserCreateInput = {
      name: name ?? '',
      isActive: true,
      role: {
        connect: {
          id: roleId,
        },
      },
      createdAt: moment().utc().toDate(),
      oauthProviders: {
        create: {
          oauthProviderId,
          externalUserId,
          email,
        },
      },
    };

    return this.prisma.user.create({
      data: userEntityToCreate,
      include: {
        role: true,
        credentials: true,
        oauthProviders: {
          select: {
            externalUserId: true,
            email: true,
            oauthProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateById(
    id: number,
    updateUserEntityDto: UpdateUserEntityDto,
  ): Promise<UserWithRoleCredentialsAndOauthProviders> {
    const { email, password, name, isActive, imageId, imageUrl, roleId } = updateUserEntityDto;
    const hashedPassword = password ? await this.generateHashedPassword(password) : undefined;
    const userEntityToUpdate: Prisma.UserUpdateInput = {
      ...(name ? { name } : {}),
      ...(roleId ? { roleId } : {}),
      ...(isActive !== undefined && isActive !== null
        ? { isActive: isActive.toString().toLowerCase() === 'true' }
        : {}),
      ...(imageId ? { imageId } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      updatedAt: moment().utc().toDate(),
      ...(email || hashedPassword
        ? {
            credentials: {
              update: {
                ...(email ? { email } : {}),
                ...(hashedPassword ? { password: hashedPassword } : {}),
              },
            },
          }
        : {}),
    };

    return this.prisma.user.update({
      where: {
        id,
      },
      data: userEntityToUpdate,
      include: {
        role: true,
        credentials: true,
        oauthProviders: {
          select: {
            externalUserId: true,
            email: true,
            oauthProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(getUsersDto: GetUsersDto): Promise<PageModel<UserWithRoleCredentialsAndOauthProviders>> {
    const { page, pageSize, role } = getUsersDto;

    const where = {
      ...(role
        ? {
            role: {
              name: role,
            },
          }
        : {}),
    };

    let skip: number | undefined;
    let take: number | undefined;
    if (pageSize) {
      let currentPage = page;
      if (!currentPage) {
        currentPage = 1;
      }
      skip = (currentPage - 1) * pageSize;
      take = +pageSize;
    }

    const entities = await this.prisma.user.findMany({
      where: {
        ...where,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        role: true,
        credentials: true,
        oauthProviders: {
          select: {
            externalUserId: true,
            email: true,
            oauthProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip,
      take,
    });

    const totalElements = await this.prisma.user.count({
      where: {
        ...where,
      },
    });
    this.logger.debug(`totalElements: ${totalElements}`);

    const pageable: PageModel<UserWithRoleCredentialsAndOauthProviders> = {
      elements: entities,
      totalElements,
    };
    return pageable;
  }

  async findOne(filter: FilterUserDto): Promise<UserWithRoleCredentialsAndOauthProviders | null> {
    const { active, id, uuid, email } = filter;

    if (!id && !uuid && !email) {
      this.logger.error('User ID or UUID or email is required');
      return null;
    }

    return this.prisma.user.findFirst({
      where: {
        ...(id ? { id } : {}),
        ...(uuid ? { uuid } : {}),
        ...(active !== undefined && active !== null ? { isActive: active.toString().toLowerCase() === 'true' } : {}),
        ...(email
          ? {
              credentials: {
                email,
              },
            }
          : {}),
      },
      include: {
        role: true,
        credentials: true,
        oauthProviders: {
          select: {
            externalUserId: true,
            email: true,
            oauthProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findOneByOauthProvider(filter: FilterOauthUserDto): Promise<UserWithRoleCredentialsAndOauthProviders | null> {
    const { oauthProviderId, externalUserId } = filter;

    if (!oauthProviderId || !externalUserId) {
      this.logger.error('Provider and external user ID required');
      return null;
    }

    return this.prisma.user.findFirst({
      where: {
        oauthProviders: {
          some: {
            oauthProviderId,
            externalUserId,
          },
        },
      },
      include: {
        role: true,
        credentials: true,
        oauthProviders: {
          select: {
            externalUserId: true,
            email: true,
            oauthProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findOneByValidResetPasswordToken(token: string): Promise<UserWithRoleCredentialsAndOauthProviders | null> {
    const now = moment().utc().toDate();
    return this.prisma.user.findFirst({
      where: {
        resetPasswordToken: {
          token,
          expiredAt: {
            gte: now,
          },
        },
      },
      include: {
        role: true,
        credentials: true,
        oauthProviders: {
          select: {
            externalUserId: true,
            email: true,
            oauthProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async isUserEmailAlreadyExists(email: string, id?: number): Promise<boolean> {
    if (!email) {
      this.logger.error('Email is required');
      return false;
    }

    const userEntity = await this.prisma.userCredentials.findFirst({
      where: {
        email,
        ...(id
          ? {
              userId: {
                not: id,
              },
            }
          : {}),
      },
      include: {
        user: true,
      },
    });
    return !!userEntity;
  }

  async deleteById(userId: number): Promise<UserWithRoleCredentialsAndOauthProviders> {
    // ON DELETE CASCADE
    return this.prisma.user.delete({
      where: {
        id: userId,
      },
      include: {
        role: true,
        credentials: true,
        oauthProviders: {
          select: {
            externalUserId: true,
            email: true,
            oauthProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  private async generateHashedPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, appConfig.SALT_ROUNDS);
    return hashedPassword;
  }
}
