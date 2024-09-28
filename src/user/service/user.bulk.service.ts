import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { UserWithRoleCredentialsAndOauthProviders } from '../../../prisma/custom-types';
import { CreateBulkUserDto } from '../dto/create.bulk.user.dto';
import { FilterUsersDto } from '../dto/filter.users.dto';
import { UpdateUserEntityDto } from '../dto/update.user.entity.dto';
import { RoleRepository } from '../repository/role.repository';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserBulkService {
  private logger = new Logger('UserBulkService');

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async bulkRegister(createUserDtos: CreateBulkUserDto[]): Promise<void> {
    if (!createUserDtos || createUserDtos.length <= 0) {
      throw new BadRequestException('No users to process');
    }

    this.logger.debug(`Number of users to register: ${createUserDtos.length}`);
    const rolesMap: Map<string, Role> = await this.roleRepository.findAllAsMap();

    const createValidUserDtos = await Promise.all(
      createUserDtos.map(async (createUserDto) => {
        const createUserDtoAsClass = plainToInstance(CreateBulkUserDto, createUserDto);
        const errors: ValidationError[] = await validate(createUserDtoAsClass);

        const isValid = !errors || errors.length <= 0;
        if (!isValid) {
          this.logger.error(
            `User validation failed for user ${JSON.stringify(createUserDto)}: ${JSON.stringify(errors)}`,
          );
          return null;
        } else {
          return createUserDto;
        }
      }),
    );

    const validEmails = createValidUserDtos
      .filter((createUserDto) => !!createUserDto)
      .map((createUserDto) => createUserDto?.email);
    this.logger.debug(`Valid user emails: ${JSON.stringify(validEmails)}`);
    if (validEmails.length <= 0) {
      return;
    }

    const filter: FilterUsersDto = {
      emails: validEmails,
    };
    const existingUserEntities = await this.userRepository.findAllByFilter(filter);

    const userEmailToIdMap: Map<string, number> = new Map();
    for (const entity of existingUserEntities) {
      if (!entity.credentials?.email) {
        this.logger.error(`User entity with id ${entity.id} has no email`);
        continue;
      }
      userEmailToIdMap.set(entity.credentials?.email, entity.id);
    }
    this.logger.debug(`Users email to ID map: ${JSON.stringify(userEmailToIdMap)}`);

    const createUserDtosToUpdate: CreateBulkUserDto[] = [];
    const createUserDtosToInsert: CreateBulkUserDto[] = [];
    for (const createValidUserDto of createValidUserDtos) {
      if (!createValidUserDto) {
        continue;
      }
      if (userEmailToIdMap.get(createValidUserDto.email) !== undefined) {
        createUserDtosToUpdate.push(createValidUserDto);
      } else {
        createUserDtosToInsert.push(createValidUserDto);
      }
    }

    // Batch UPDATE
    const usersUpdated = await this.batchUpdate(createUserDtosToUpdate, rolesMap, userEmailToIdMap);
    this.logger.verbose(`Number of users updated succesfully: ${usersUpdated.length}`);

    // Batch INSERT
    const usersCreated = await this.batchInsert(createUserDtosToInsert, rolesMap);
    this.logger.verbose(`Number of users inserted succesfully: ${usersCreated.length}`);
  }

  private async batchUpdate(
    createUserDtosToUpdate: CreateBulkUserDto[],
    rolesMap: Map<string, Role>,
    userEmailToIdMap: Map<string, number>,
  ): Promise<UserWithRoleCredentialsAndOauthProviders[]> {
    this.logger.debug(`Users to update: ${JSON.stringify(createUserDtosToUpdate)}`);
    if (createUserDtosToUpdate.length <= 0) {
      return [];
    }
    const updateUsersPromises: any[] = [];

    for (const createUserDto of createUserDtosToUpdate) {
      const { name, role } = createUserDto;
      const id = userEmailToIdMap.get(createUserDto.email);
      if (!id) {
        this.logger.error(`Cannot find user id for email ${createUserDto.email}`);
        continue;
      }
      const roleEntity = rolesMap.get(role);
      if (!roleEntity?.id) {
        this.logger.error(`Cannot find role entity with name ${role}`);
        continue;
      }

      const updateUserEntityDto: UpdateUserEntityDto = {
        name,
        roleId: roleEntity.id,
      };
      updateUsersPromises.push(() => this.userRepository.updateById(id, updateUserEntityDto));
    }

    const usersUpdated = await Promise.all(updateUsersPromises.map((p) => p().catch((err) => this.logger.error(err))));
    this.logger.debug(`Users updated: ${JSON.stringify(usersUpdated)}`);
    return usersUpdated;
  }

  private async batchInsert(
    createUserDtosToInsert: CreateBulkUserDto[],
    rolesMap: Map<string, Role>,
  ): Promise<UserWithRoleCredentialsAndOauthProviders[]> {
    this.logger.debug(`Users to insert: ${JSON.stringify(createUserDtosToInsert)}`);
    if (createUserDtosToInsert.length <= 0) {
      return [];
    }

    const createUsersPromises: any[] = [];

    for (const createUserDto of createUserDtosToInsert) {
      const { email, name, role } = createUserDto;
      const roleEntity = rolesMap.get(role);
      if (!roleEntity?.id) {
        this.logger.error(`Cannot find role entity with name ${role}`);
        continue;
      }

      const password = uuidv4();
      createUsersPromises.push(() => this.userRepository.create({ email, name, password, roleId: roleEntity.id }));
    }

    const usersCreated = await Promise.all(createUsersPromises.map((p) => p().catch((err) => this.logger.error(err))));
    this.logger.debug(`Users updated: ${JSON.stringify(usersCreated)}`);
    return usersCreated;
  }
}
