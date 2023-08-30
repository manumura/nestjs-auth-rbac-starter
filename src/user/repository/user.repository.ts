import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import moment from 'moment';
import { UserWithRole } from '../../../prisma/custom-types';
import { PrismaService } from '../../../prisma/prisma.service';
import { appConfig } from '../../config/config';
import { PageModel } from '../../shared/model/page.model';
import { CreateUserDto } from '../dto/create.user.dto';
import { FilterUserDto } from '../dto/filter.user.dto';
import { FilterUsersDto } from '../dto/filter.users.dto';
import { GetUsersDto } from '../dto/get.users.dto';
import { UpdateUserEntityDto } from '../dto/update.user.entity.dto';
import { Role as RoleEnum } from '../model/role.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserRepository {
  private logger = new Logger('UserRepository');

  constructor(private readonly prisma: PrismaService) {}

  async isPasswordValid(password1: string, password2: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password1, password2);
    return isValid;
  }

  async create(email: string, name: string, password: string, roleId: number): Promise<UserWithRole> {
    const hashedPassword = await this.generateHashedPassword(password);
    const userEntityToCreate: Prisma.UserCreateInput = {
      password: hashedPassword,
      email,
      name: name ? name : '',
      isActive: true,
      role: {
        connect: {
          id: roleId,
        },
      },
      createdAt: moment().utc().toDate(),
    };

    return this.prisma.user.create({
      data: userEntityToCreate,
      include: {
        role: true,
      },
    });
  }

  async createMany(createUserDtos: CreateUserDto[], rolesMap: Map<string, Role>): Promise<number> {
    const initUserToCreatePromises: any[] = [];
    createUserDtos.forEach((createUserDto) => {
      initUserToCreatePromises.push(() => this.initUserToCreate(createUserDto, rolesMap));
    });

    const users = await Promise.all(initUserToCreatePromises.map((p) => p().catch((err) => this.logger.error(err))));
    const usersToInsert = users.filter((user): user is Prisma.UserCreateManyInput => user !== null);

    const result = await this.prisma.user.createMany({
      data: usersToInsert,
      skipDuplicates: true,
    });

    return result.count;
  }

  private async initUserToCreate(createUserDto: CreateUserDto, rolesMap: Map<string, Role>) {
    const { email, name, role } = createUserDto;
    const password = uuidv4();
    const hashedPassword = await this.generateHashedPassword(password);
    const roleEntity = rolesMap.get(role);
    if (!roleEntity || !roleEntity.id) {
      this.logger.error(`Cannot find role entity with name ${role}`);
      return null;
    }

    const userEntity: Prisma.UserCreateManyInput = {
      password: hashedPassword,
      email,
      name: name ? name : '',
      isActive: true,
      roleId: roleEntity.id,
      createdAt: moment().utc().toDate(),
    };

    return userEntity;
  }

  async updateById(id: number, updateUserEntityDto: UpdateUserEntityDto): Promise<UserWithRole> {
    const { email, password, name, isActive, imageId, imageUrl, roleId } = updateUserEntityDto;
    const hashedPassword = password ? await this.generateHashedPassword(password) : undefined;
    const userEntityToUpdate: Prisma.UserUpdateInput = {
      ...(email ? { email } : {}),
      ...(hashedPassword ? { password: hashedPassword } : {}),
      ...(name ? { name } : {}),
      ...(roleId ? { roleId } : {}),
      ...(isActive !== undefined && isActive !== null
        ? { isActive: isActive.toString().toLowerCase() === 'true' }
        : {}),
      ...(imageId ? { imageId } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      updatedAt: moment().utc().toDate(),
    };

    return this.prisma.user.update({
      where: {
        id,
      },
      data: userEntityToUpdate,
      include: {
        role: true,
      },
    });
  }

  async updateByEmail(email: string, updateUserEntityDto: UpdateUserEntityDto): Promise<UserWithRole> {
    const { password, name, isActive, roleId } = updateUserEntityDto;
    const hashedPassword = password ? await this.generateHashedPassword(password) : undefined;
    const userEntityToUpdate: Prisma.UserUpdateInput = {
      ...(hashedPassword ? { password: hashedPassword } : {}),
      ...(name ? { name } : {}),
      ...(roleId ? { roleId } : {}),
      ...(isActive !== undefined && isActive !== null
        ? { isActive: isActive.toString().toLowerCase() === 'true' }
        : {}),
      updatedAt: moment().utc().toDate(),
    };

    return this.prisma.user.update({
      where: {
        email,
      },
      data: userEntityToUpdate,
      include: {
        role: true,
      },
    });
  }

  async findAll(getUsersDto: GetUsersDto): Promise<PageModel<UserWithRole>> {
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

    const pageable: PageModel<UserWithRole> = {
      elements: entities,
      totalElements,
    };
    return pageable;
  }

  async findAllByFilter(filter: FilterUsersDto): Promise<UserWithRole[]> {
    const { active, role, langCode, emails } = filter;

    const entities = this.prisma.user.findMany({
      where: {
        ...(active !== undefined && active !== null ? { isActive: active.toString().toLowerCase() === 'true' } : {}),
        ...(role
          ? {
              role: {
                name: role,
              },
            }
          : {}),
        ...(langCode ? { langCode: langCode } : {}),
        ...(emails
          ? {
              email: {
                in: emails,
              },
            }
          : {}),
      },
      include: {
        role: true,
      },
    });

    return entities;
  }

  async findOne(filter: FilterUserDto): Promise<UserWithRole | null> {
    const { active, id, uuid, email } = filter;

    if (!id && !uuid && !email) {
      this.logger.error('User ID or UUID or email is required');
      return null;
    }

    return this.prisma.user.findFirst({
      where: {
        ...(id ? { id } : {}),
        ...(uuid ? { uuid } : {}),
        ...(email ? { email } : {}),
        ...(active !== undefined && active !== null ? { isActive: active.toString().toLowerCase() === 'true' } : {}),
      },
      include: {
        role: true,
      },
    });
  }

  async findOneByValidResetPasswordToken(token: string): Promise<UserWithRole | null> {
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
      },
    });
  }

  async isUserEmailAlreadyExists(email: string, id?: number): Promise<boolean> {
    if (!email) {
      this.logger.error('Email is required');
      return false;
    }

    const userEntity = await this.prisma.user.findFirst({
      where: {
        email,
        ...(id
          ? {
              id: {
                not: id,
              },
            }
          : {}),
      },
      include: {
        role: true,
      },
    });
    return !!userEntity;
  }

  async deleteById(userId: number): Promise<UserWithRole> {
    // ON DELETE CASCADE
    return this.prisma.user.delete({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });
  }

  private async generateHashedPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, appConfig.SALT_ROUNDS);
    return hashedPassword;
  }
}
