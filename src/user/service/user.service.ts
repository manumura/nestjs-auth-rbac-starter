import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { UserWithRole } from '../../../prisma/custom-types';
import { EmailService } from '../../notification/email.service';
import { PageModel } from '../../shared/model/page.model';
import { FileDto } from '../../storage/file.dto';
import { StorageService } from '../../storage/storage.service';
import { CreateUserDto } from '../dto/create.user.dto';
import { FilterUserDto } from '../dto/filter.user.dto';
import { FilterUsersDto } from '../dto/filter.users.dto';
import { GetUsersDto } from '../dto/get.users.dto';
import { RegisterDto } from '../dto/register.dto';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { UpdateUserDto } from '../dto/update.user.dto';
import { UpdateUserEntityDto } from '../dto/update.user.entity.dto';
import { UserMapper } from '../mapper/user.mapper';
import { Role as RoleEnum } from '../model/role.model';
import { UserModel } from '../model/user.model';
import { RoleRepository } from '../repository/role.repository';
import { UserRepository } from '../repository/user.repository';
import { UUID } from 'crypto';
import { appConfig } from '../../config/config';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  constructor(
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async findAll(getUsersDto: GetUsersDto): Promise<PageModel<UserModel>> {
    const entitiesPageable = await this.userRepository.findAll(getUsersDto);
    const users = this.userMapper.entitiesToModels(entitiesPageable.elements);
    const modelsPageable: PageModel<UserModel> = {
      elements: users,
      totalElements: entitiesPageable.totalElements,
    };
    return modelsPageable;
  }

  async findByUuid(uuid: UUID): Promise<UserModel> {
    if (!uuid) {
      throw new BadRequestException('UUID cannot be undefined');
    }

    const filterByUuid: FilterUserDto = {
      uuid,
    };
    const entity = await this.userRepository.findOne(filterByUuid);
    if (!entity) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }
    const user = this.userMapper.entityToModel(entity);
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  }

  async findByIdAndEmail(id: number, email: string): Promise<UserModel> {
    if (!id || !email) {
      throw new BadRequestException('ID and email cannot be undefined');
    }

    const filter: FilterUserDto = {
      id,
      email,
    };
    const entity = await this.userRepository.findOne(filter);
    if (!entity) {
      throw new NotFoundException(`User with ID ${id} and email ${email} not found`);
    }
    const user = this.userMapper.entityToModel(entity);
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  }

  async findByValidResetPasswordToken(token: string): Promise<UserModel> {
    if (!token) {
      throw new BadRequestException('Token cannot be undefined');
    }

    const entity = await this.userRepository.findOneByValidResetPasswordToken(token);
    if (!entity) {
      throw new NotFoundException(`User not deleted with valid token ${token} not found`);
    }
    const user = this.userMapper.entityToModel(entity);
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  }

  async register(registerDto: RegisterDto): Promise<UserModel> {
    const { email, password, name } = registerDto;
    if (!email || !password) {
      throw new BadRequestException('Email or password undefined');
    }

    const user = await this.create(email, name, RoleEnum.USER, password);

    // TODO send email to root user
    const rootUserEmail = appConfig.ROOT_ACCOUNT_EMAIL;
    this.logger.verbose(`[EMAIL][NEW_USER] Sending email to: ${rootUserEmail}`);
    this.emailService
      .sendNewUserEmail(rootUserEmail, 'en', email)
      .then((result) => {
        this.logger.verbose(`[EMAIL][NEW_USER] Result Sending email: ${JSON.stringify(result)}`);
      })
      .catch((err) => this.logger.error(err));

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserModel> {
    const { email, name, role } = createUserDto;
    if (!email || !role) {
      throw new BadRequestException('Email or role undefined');
    }

    const generatedPassword = uuidv4();
    this.logger.debug(`generatedPassword: ${generatedPassword}`);

    const user = await this.create(email, name, role, generatedPassword);

    // Send email with password
    this.logger.verbose(`[EMAIL][REGISTER] Sending email to: ${email}`);
    this.emailService
      .sendTemporaryPasswordEmail(email, 'en', generatedPassword)
      .then((result) => {
        this.logger.verbose(`[EMAIL][REGISTER] Result Sending email: ${JSON.stringify(result)}`);
      })
      .catch((err) => this.logger.error(err));

    return user;
  }

  private async create(email: string, name: string, role: RoleEnum, password: string): Promise<UserModel> {
    const roleEntity = await this.roleRepository.findByName(role);
    if (!roleEntity) {
      throw new NotFoundException(`Role not found by name: ${role}`);
    }

    const filterByEmail: FilterUserDto = {
      email,
    };
    const userEntityFound = await this.userRepository.findOne(filterByEmail);
    this.logger.debug(`User with email already exists: ${JSON.stringify(userEntityFound)}`);

    if (userEntityFound) {
      throw new ConflictException('Cannot create user');
    }

    const userEntityCreated = await this.userRepository.create(email, name, password, roleEntity.id);
    const user = this.userMapper.entityToModel(userEntityCreated);
    this.logger.debug(`User created: ${JSON.stringify(user)}`);
    return user;
  }

  async updateProfileById(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserModel> {
    this.logger.debug('Update profile by ID');
    const { name, password } = updateProfileDto;
    if (!userId || (!name && !password)) {
      throw new BadRequestException('User ID, or name and password undefined');
    }

    this.logger.debug(`Find user by ID: ${userId}`);
    const filterById: FilterUserDto = {
      id: userId,
    };
    const userEntity = await this.userRepository.findOne(filterById);
    this.logger.debug(`User found: ${JSON.stringify(userEntity)}`);
    if (!userEntity) {
      throw new NotFoundException(`User not found with ID: ${userId}`);
    }

    const updateUserEntityDto: UpdateUserEntityDto = {
      password,
      name,
    };

    const updatedUserEntity = await this.userRepository.updateById(userId, updateUserEntityDto);
    const user = this.userMapper.entityToModel(updatedUserEntity);
    this.logger.debug(`Update user success: user updated ${JSON.stringify(user)}`);

    return user;
  }

  async updateImageById(userId: number, file: MultipartFile): Promise<UserModel> {
    this.logger.debug('Update user image by ID');

    if (!userId) {
      throw new BadRequestException('User ID undefined');
    }

    const saveResponse = await this.storageService.saveImageToLocalPath(file);
    if (!saveResponse) {
      throw new InternalServerErrorException('Error while saving file');
    }

    this.logger.verbose(`Uploading file: ${saveResponse.filename}`);
    const uploadResponse = await this.storageService.uploadProfileImage(saveResponse.filepath, userId);
    this.logger.verbose(`Upload result: ${JSON.stringify(uploadResponse)}`);
    this.storageService.deleteFromLocalPath(saveResponse.filepath);

    if (!uploadResponse || !uploadResponse.public_id || !uploadResponse.secure_url) {
      throw new BadRequestException('Image ID or image URL undefined');
    }

    this.logger.debug(`Find user by ID: ${userId}`);
    const filterById: FilterUserDto = {
      id: userId,
    };
    const userEntity = await this.userRepository.findOne(filterById);
    this.logger.debug(`User found: ${JSON.stringify(userEntity)}`);
    if (!userEntity) {
      throw new NotFoundException(`User not found with ID: ${userId}`);
    }

    // Delete previous image
    if (userEntity.imageId) {
      await this.storageService.delete(userEntity.imageId);
    }

    const updateUserDto: UpdateUserEntityDto = {
      imageId: uploadResponse.public_id,
      imageUrl: uploadResponse.secure_url,
    };

    const updatedUserEntity = await this.userRepository.updateById(userId, updateUserDto);
    const user = this.userMapper.entityToModel(updatedUserEntity);
    this.logger.debug(`Update user success: user updated ${JSON.stringify(user)}`);
    return user;
  }

  async updateUserByUuid(userUuid: UUID, updateUserDto: UpdateUserDto): Promise<UserModel> {
    this.logger.debug('Update user by UUID');
    const { email, password, name, active, role } = updateUserDto;
    if (!userUuid) {
      throw new BadRequestException('User UUID undefined');
    }

    this.logger.debug(`Find user by UUID: ${userUuid}`);
    const filterByUuid: FilterUserDto = {
      uuid: userUuid,
    };
    const userEntity = await this.userRepository.findOne(filterByUuid);
    this.logger.debug(`User found: ${JSON.stringify(userEntity)}`);
    if (!userEntity) {
      throw new NotFoundException(`User not found with UUID: ${userUuid}`);
    }

    if (email) {
      const isUserEmailAlreadyExists = await this.userRepository.isUserEmailAlreadyExists(email, userEntity.id);
      this.logger.debug(`User found with email ${email}: ${isUserEmailAlreadyExists}`);
      if (isUserEmailAlreadyExists) {
        throw new BadRequestException(`User with email ${email} already exists`);
      }
    }

    const updateUserEntityDto: UpdateUserEntityDto = {
      email,
      password,
      name,
      isActive: active,
    };

    if (role) {
      const roleEntity = await this.roleRepository.findByName(role);
      if (!roleEntity) {
        throw new NotFoundException(`Role not found by name: ${role}`);
      }
      updateUserEntityDto.roleId = roleEntity.id;
    }

    const updatedUserEntity = await this.userRepository.updateById(userEntity.id, updateUserEntityDto);
    const user = this.userMapper.entityToModel(updatedUserEntity);
    this.logger.debug(`Update user success: user updated ${JSON.stringify(user)}`);
    return user;
  }

  async deleteById(userUuid: UUID): Promise<UserModel> {
    this.logger.debug('Delete user by UUID');
    if (!userUuid) {
      throw new BadRequestException('User UUID undefined');
    }

    this.logger.debug(`Find user by UUID: ${userUuid}`);
    const filterByUuid: FilterUserDto = {
      uuid: userUuid,
    };
    const userEntity = await this.userRepository.findOne(filterByUuid);
    this.logger.debug(`User found: ${JSON.stringify(userEntity)}`);
    if (!userEntity) {
      throw new NotFoundException(`User not found with UUID: ${userUuid}`);
    }

    const deletedUserEntity = await this.userRepository.deleteById(userEntity.id);
    const user = this.userMapper.entityToModel(deletedUserEntity);
    this.logger.debug(`Update user success: user updated ${JSON.stringify(user)}`);
    return user;
  }

  async batchRegister(createUserDtos: CreateUserDto[]): Promise<void> {
    if (!createUserDtos || createUserDtos.length <= 0) {
      throw new BadRequestException('No users to process');
    }

    this.logger.debug(`Number of users to register: ${createUserDtos.length}`);
    const rolesMap: Map<string, Role> = await this.roleRepository.findAllAsMap();
    const userValidEmails: string[] = [];
    const createValidUserDtos: CreateUserDto[] = [];

    await Promise.all(
      createUserDtos.map(async (createUserDto) => {
        const { email } = createUserDto;
        const createUserDtoAsClass = plainToInstance(CreateUserDto, createUserDto);
        const errors: ValidationError[] = await validate(createUserDtoAsClass);

        const isValid = !errors || errors.length <= 0;
        if (!isValid) {
          this.logger.error(
            `User validation failed for user ${JSON.stringify(createUserDto)}: ${JSON.stringify(errors)}`,
          );
        } else {
          userValidEmails.push(email);
          createValidUserDtos.push(createUserDto);
        }
        return isValid;
      }),
    );

    this.logger.debug(`Valid user emails: ${JSON.stringify(userValidEmails)}`);
    if (userValidEmails.length <= 0) {
      return;
    }

    const filter: FilterUsersDto = {
      emails: userValidEmails,
    };
    const userExistingEntities = await this.userRepository.findAllByFilter(filter);
    const userExistingEmails = userExistingEntities.map((user) => user.email);
    this.logger.debug(`Users already existing: ${JSON.stringify(userExistingEmails)}`);

    // Batch UPDATE
    const users = await this.batchUpdate(createValidUserDtos, userExistingEntities, userExistingEmails, rolesMap);
    this.logger.verbose(`Number of users updated succesfully: ${users.length}`);

    // Batch INSERT
    const rows = await this.batchInsert(createValidUserDtos, userExistingEmails, rolesMap);
    this.logger.verbose(`Number of users inserted succesfully: ${rows}`);
  }

  private async batchUpdate(
    createValidUserDtos: CreateUserDto[],
    userExistingEntities: UserWithRole[],
    userExistingEmails: string[],
    rolesMap: Map<string, Role>,
  ): Promise<UserWithRole[]> {
    const createUserDtosToUpdate: CreateUserDto[] = createValidUserDtos.filter((createUserDto) => {
      return userExistingEmails.includes(createUserDto.email);
    });
    this.logger.debug(`Users to update: ${JSON.stringify(createUserDtosToUpdate)}`);

    const updateUsersPromises: any[] = [];
    userExistingEntities.forEach(async (user: UserWithRole) => {
      const createUserDto = createUserDtosToUpdate.find((u) => u.email === user.email);
      if (!createUserDto) {
        this.logger.error(`Cannot find existing user with email ${user.email}`);
        return;
      }

      const { email, name, role } = createUserDto;
      const roleEntity = rolesMap.get(role);
      if (!roleEntity || !roleEntity.id) {
        this.logger.error(`Cannot find role entity with name ${role}`);
        return;
      }

      const updateUserEntityDto: UpdateUserEntityDto = {
        name: name ? name : '',
        isActive: true,
        roleId: roleEntity.id,
      };
      updateUsersPromises.push(() => this.userRepository.updateByEmail(email, updateUserEntityDto));
    });

    const usersUpdated = await Promise.all(updateUsersPromises.map((p) => p().catch((err) => this.logger.error(err))));
    this.logger.debug(`Users updated: ${JSON.stringify(usersUpdated)}`);
    return usersUpdated;
  }

  private async batchInsert(
    createValidUserDtos: CreateUserDto[],
    userExistingEmails: string[],
    rolesMap: Map<string, Role>,
  ): Promise<number> {
    const createUserDtosToInsert: CreateUserDto[] = createValidUserDtos.filter((createUserDto) => {
      return !userExistingEmails.includes(createUserDto.email);
    });
    this.logger.debug(`Users to insert: ${JSON.stringify(createUserDtosToInsert)}`);

    if (createUserDtosToInsert.length > 0) {
      this.logger.verbose(`Trying to insert ${createUserDtosToInsert.length} users`);
      return this.userRepository.createMany(createUserDtosToInsert, rolesMap);
    } else {
      return 0;
    }
  }

  private generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
