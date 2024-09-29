import { MultipartFile } from '@fastify/multipart';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { UUID } from 'crypto';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { UserWithRole, UserWithRoleCredentialsAndOauthProviders } from '../../../prisma/custom-types';
import { appConfig } from '../../config/config';
import { EmailService } from '../../notification/email.service';
import { PageModel } from '../../shared/model/page.model';
import { UploadResponseModel } from '../../shared/model/upload.response.model';
import { StorageService } from '../../storage/storage.service';
import { CreateUserDto } from '../dto/create.user.dto';
import { FilterUserDto } from '../dto/filter.user.dto';
import { GetUsersDto } from '../dto/get.users.dto';
import { RegisterDto } from '../dto/register.dto';
import { UpdatePasswordDto } from '../dto/update.password.dto';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { UpdateUserDto } from '../dto/update.user.dto';
import { UpdateUserEntityDto } from '../dto/update.user.entity.dto';
import { UserMapper } from '../mapper/user.mapper';
import { AuthenticatedUserModel } from '../model/authenticated.user.model';
import { Role as RoleEnum } from '../model/role.model';
import { UserChangeEvent, UserChangeEventType } from '../model/user.change.event';
import { UserModel } from '../model/user.model';
import { RoleRepository } from '../repository/role.repository';
import { UserRepository } from '../repository/user.repository';
import { isPasswordValid } from '../../shared/util/utils';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  private readonly userChangeEventSubject = new BehaviorSubject<UserChangeEvent | null>(null);

  constructor(
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userMapper: UserMapper,
  ) {}

  get userChangeEvent$(): Observable<UserChangeEvent | null> {
    return this.userChangeEventSubject.asObservable();
  }

  pushUserChangeEvent(userChangeEvent: UserChangeEvent): void {
    this.logger.debug(`Pushing user change event: ${JSON.stringify(userChangeEvent)}`);
    this.userChangeEventSubject.next(userChangeEvent);
  }

  async findAll(getUsersDto: GetUsersDto): Promise<PageModel<UserModel>> {
    const entitiesPageable = await this.userRepository.findAll(getUsersDto);
    const users = this.userMapper.entitiesToModels(entitiesPageable.elements);
    const modelsPageable: PageModel<UserModel> = {
      elements: users,
      totalElements: entitiesPageable.totalElements,
    };
    return modelsPageable;
  }

  async findByUuid(userUuid: UUID): Promise<UserModel> {
    const userEntity = await this.getByUserUuid(userUuid);
    const user = this.userMapper.entityToModel(userEntity);
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  }

  async findByValidResetPasswordToken(token: string): Promise<UserModel> {
    if (!token) {
      throw new BadRequestException('Token cannot be undefined');
    }

    const entity = await this.userRepository.findOneByValidResetPasswordToken(token);
    if (!entity) {
      throw new NotFoundException(`User with valid token ${token} not found`);
    }
    const user = this.userMapper.entityToModel(entity);
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  }

  async findByValidVerifyEmailToken(token: string): Promise<UserModel> {
    if (!token) {
      throw new BadRequestException('Token cannot be undefined');
    }

    const entity = await this.userRepository.findByValidVerifyEmailToken(token);
    if (!entity) {
      throw new NotFoundException(`User with valid token ${token} not found`);
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

    const roleEntity = await this.roleRepository.findByName(RoleEnum.USER);
    if (!roleEntity) {
      throw new NotFoundException(`Role not found by name: ${RoleEnum.USER}`);
    }

    const filterByEmail: FilterUserDto = {
      email,
    };
    const userEntityFound = await this.userRepository.findOne(filterByEmail);
    this.logger.debug(`User with email already exists: ${JSON.stringify(userEntityFound)}`);

    if (userEntityFound) {
      throw new ConflictException('Registration failed. Please check that your email is correct.');
    }

    const verifyEmailToken = uuidv4();
    const userEntityCreated = await this.userRepository.register({
      email,
      name,
      password,
      roleId: roleEntity.id,
      verifyEmailToken,
    });
    const user = this.userMapper.entityToModel(userEntityCreated);
    this.logger.debug(`User created: ${JSON.stringify(user)}`);

    // Push new user event
    const event = new UserChangeEvent(UserChangeEventType.CREATED, user);
    this.pushUserChangeEvent(event);

    // Send email with link to verify email
    this.logger.verbose(`[EMAIL][REGISTER] Sending email to: ${email}`);
    this.emailService
      .sendRegistrationEmail(email, 'en', verifyEmailToken)
      .then((result) => {
        this.logger.verbose(`[EMAIL][REGISTER] Result Sending email: ${JSON.stringify(result)}`);
      })
      .catch((err) => this.logger.error(err));

    // Send new user email to root user
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

  async createUser(createUserDto: CreateUserDto, currentUser: AuthenticatedUserModel): Promise<UserModel> {
    const { email, name, role } = createUserDto;
    if (!email || !role) {
      throw new BadRequestException('Email or role undefined');
    }

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

    const generatedPassword = uuidv4();
    this.logger.debug(`generatedPassword: ${generatedPassword}`);

    const userEntityCreated = await this.userRepository.create({
      email,
      name,
      password: generatedPassword,
      roleId: roleEntity.id,
    });
    const user = this.userMapper.entityToModel(userEntityCreated);
    this.logger.debug(`User created: ${JSON.stringify(user)}`);

    // Push new user event
    const event = new UserChangeEvent(UserChangeEventType.CREATED, user, currentUser.uuid);
    this.pushUserChangeEvent(event);

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

  async updateProfileByUserUuid(userUuid: UUID, updateProfileDto: UpdateProfileDto): Promise<UserModel> {
    this.logger.debug('Update profile by ID');
    const { name } = updateProfileDto;
    if (!name) {
      throw new BadRequestException('Name must be defined');
    }

    const userEntity = await this.getByUserUuid(userUuid);
    const updateUserEntityDto: UpdateUserEntityDto = {
      name,
    };

    const updatedUserEntity = await this.userRepository.updateById(userEntity.id, updateUserEntityDto);
    const user = this.userMapper.entityToModel(updatedUserEntity);
    this.logger.debug(`Update user success: user updated ${JSON.stringify(user)}`);

    // Push new user event
    const event = new UserChangeEvent(UserChangeEventType.UPDATED, user, userUuid);
    this.pushUserChangeEvent(event);

    return user;
  }

  async updateByUuid(userUuid: UUID, updateUserDto: UpdateUserDto): Promise<UserModel> {
    this.logger.debug('Update user by UUID');
    const { email, password, name, active, role } = updateUserDto;
    const userEntity = await this.getByUserUuid(userUuid);

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

    // Push new user event
    const event = new UserChangeEvent(UserChangeEventType.UPDATED, user, userUuid);
    this.pushUserChangeEvent(event);

    return user;
  }

  async updatePasswordByUserUuid(userUuid: UUID, updatePasswordDto: UpdatePasswordDto): Promise<UserModel> {
    this.logger.debug('Update password by user ID');
    const { oldPassword, newPassword } = updatePasswordDto;
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Password must be defined');
    }

    const userEntity = await this.getByUserUuid(userUuid);
    if (!userEntity.credentials) {
      throw new NotFoundException('User credentials not found');
    }

    const isValidPassword = await isPasswordValid(oldPassword, userEntity.credentials.password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid password');
    }

    const updateUserEntityDto: UpdateUserEntityDto = {
      password: newPassword,
    };

    const updatedUserEntity = await this.userRepository.updateById(userEntity.id, updateUserEntityDto);
    const user = this.userMapper.entityToModel(updatedUserEntity);
    this.logger.debug(`Update user success: user updated ${JSON.stringify(user)}`);

    return user;
  }

  async updateImageByUserUuid(userUuid: UUID, file: MultipartFile): Promise<UserModel> {
    this.logger.debug('Update user image by user ID');
    const userEntity = await this.getByUserUuid(userUuid);

    const saveResponse = await this.storageService.saveImageToLocalPath(file);
    if (!saveResponse) {
      throw new InternalServerErrorException('Error while saving file');
    }

    const user = await this.uploadAndUpdateImage(userEntity, saveResponse);
    return user;
  }

  private async uploadAndUpdateImage(userEntity: UserWithRole, saveResponse: UploadResponseModel): Promise<UserModel> {
    const uploadResponse = await this.upload(userEntity, saveResponse);
    const user = await this.updateImage(userEntity, uploadResponse);
    return user;
  }

  private async upload(userEntity: UserWithRole, saveResponse: UploadResponseModel): Promise<UploadApiResponse> {
    this.logger.verbose(`Uploading file: ${saveResponse.filename}`);
    const uploadResponse = await this.storageService.uploadProfileImage(saveResponse.filepath, userEntity.uuid);
    this.logger.verbose(`Upload result: ${JSON.stringify(uploadResponse)}`);

    this.storageService.deleteFromLocalPath(saveResponse.filepath);

    if (!uploadResponse?.public_id || !uploadResponse?.secure_url) {
      throw new BadRequestException('Image ID or image URL undefined');
    }

    return uploadResponse;
  }

  private async updateImage(userEntity: UserWithRole, uploadResponse: UploadApiResponse): Promise<UserModel> {
    // Delete previous image
    if (userEntity.imageId) {
      await this.storageService.delete(userEntity.imageId);
    }

    const updateUserDto: UpdateUserEntityDto = {
      imageId: uploadResponse.public_id,
      imageUrl: uploadResponse.secure_url,
    };

    const updatedUserEntity = await this.userRepository.updateById(userEntity.id, updateUserDto);
    const user = this.userMapper.entityToModel(updatedUserEntity);
    this.logger.debug(`Update user success: user updated ${JSON.stringify(user)}`);

    // Push new user event
    const event = new UserChangeEvent(UserChangeEventType.UPDATED, user, userEntity.uuid as UUID);
    this.pushUserChangeEvent(event);

    return user;
  }

  async deleteByUuid(userUuid: UUID): Promise<UserModel> {
    this.logger.debug('Delete user by UUID');
    const userEntity = await this.getByUserUuid(userUuid);

    const deletedUserEntity = await this.userRepository.deleteById(userEntity.id);
    const user = this.userMapper.entityToModel(deletedUserEntity);
    this.logger.debug(`Update user success: user updated ${JSON.stringify(user)}`);

    // Push new user event
    const event = new UserChangeEvent(UserChangeEventType.DELETED, user, userUuid);
    this.pushUserChangeEvent(event);

    return user;
  }

  private async getByUserUuid(userUuid: UUID): Promise<UserWithRoleCredentialsAndOauthProviders> {
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
    return userEntity;
  }
}
