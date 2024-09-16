import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { UserWithRole, UserWithRoleAndCredentials } from '../../../prisma/custom-types';
import { PrismaService } from '../../../prisma/prisma.service';
import { appConfig } from '../../config/config';
import { PageModel } from '../../shared/model/page.model';
import { CreateUserDto } from '../dto/create.user.dto';
import { FilterUserDto } from '../dto/filter.user.dto';
import { FilterUsersDto } from '../dto/filter.users.dto';
import { GetUsersDto } from '../dto/get.users.dto';
import { UpdateUserEntityDto } from '../dto/update.user.entity.dto';
import { nanoid } from 'nanoid';
import { FilterOauthUserDto } from '../dto/filter.oauth.user.dto';

@Injectable()
export class UserRepository {
  private logger = new Logger('UserRepository');

  constructor(private readonly prisma: PrismaService) {}

  // async createMany(createUserDtos: CreateUserDto[], rolesMap: Map<string, Role>): Promise<number> {
  //   const initUserToCreatePromises: any[] = [];
  //   createUserDtos.forEach((createUserDto) => {
  //     initUserToCreatePromises.push(() => this.initUserToCreate(createUserDto, rolesMap));
  //   });

  //   const users = await Promise.all(initUserToCreatePromises.map((p) => p().catch((err) => this.logger.error(err))));
  //   const usersToInsert = users.filter((user): user is Prisma.UserCreateManyInput => user !== null);

  //   const result = await this.prisma.user.createMany({
  //     data: usersToInsert,
  //     skipDuplicates: true,
  //   });

  //   return result.count;
  // }

  // private async initUserToCreate(createUserDto: CreateUserDto, rolesMap: Map<string, Role>) {
  //   const { email, name, role } = createUserDto;
  //   const password = uuidv4();
  //   const hashedPassword = await this.generateHashedPassword(password);
  //   const roleEntity = rolesMap.get(role);
  //   if (!roleEntity?.id) {
  //     this.logger.error(`Cannot find role entity with name ${role}`);
  //     return null;
  //   }

  //   const c:  Prisma.UserCredentialsCreateManyInput = {
  //     email,
  //     password: hashedPassword,
  //     isEmailVerified: true,
  //     userId
  //   };

  //   const userEntity: Prisma.UserCreateManyInput = {
  //     // password: hashedPassword,
  //     // email,
  //     name,
  //     isActive: true,
  //     roleId: roleEntity.id,
  //     createdAt: moment().utc().toDate(),
  //   };

  //   return userEntity;
  // }

  // async updateByEmail(email: string, updateUserEntityDto: UpdateUserEntityDto): Promise<UserWithRole> {
  //   const { password, name, isActive, roleId } = updateUserEntityDto;
  //   const hashedPassword = password ? await this.generateHashedPassword(password) : undefined;
  //   const userEntityToUpdate: Prisma.UserUpdateInput = {
  //     ...(hashedPassword ? { password: hashedPassword } : {}),
  //     ...(name ? { name } : {}),
  //     ...(roleId ? { roleId } : {}),
  //     ...(isActive !== undefined && isActive !== null
  //       ? { isActive: isActive.toString().toLowerCase() === 'true' }
  //       : {}),
  //     updatedAt: moment().utc().toDate(),
  //   };

  //   // https://github.com/prisma/prisma/discussions/12413
  //   const u = this.prisma.userCredentials.update({
  //     where: {
  //       email,
  //     },
  //     data: {
  //       user: {
  //         update: userEntityToUpdate,
  //       },
  //     },
  //     include: {
  //       user: {
  //         include: {
  //           role: true,
  //         },
  //       },
  //     },
  //   });

  //   return this.prisma.user.update({
  //     where: {
  //       credentials: {
  //         email,
  //       },
  //     },
  //     data: userEntityToUpdate,
  //     include: {
  //       role: true,
  //     },
  //   });
  // }

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
        // TODO email is in credentials
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
}
