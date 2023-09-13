import { MailerModule } from '@nestjs-modules/mailer';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserWithRole } from '../../../prisma/custom-types';
import { ResetPasswordTokenMapper } from '../../authentication/mapper/reset.password.token.mapper';
import { AuthenticationTokenRepository } from '../../authentication/repository/authentication.token.repository';
import { ResetPasswordTokenRepository } from '../../authentication/repository/reset.password.token.repository';
import { EmailService } from '../../notification/email.service';
import { PageModel } from '../../shared/model/page.model';
import { GetUsersDto } from '../dto/get.users.dto';
import { UserMapper } from '../mapper/user.mapper';
import { Role } from '../model/role.model';
import { UserModel } from '../model/user.model';
import { RoleRepository } from '../repository/role.repository';
import { UserRepository } from '../repository/user.repository';
import { UserService } from './user.service';
import { randomUUID } from 'crypto';
import { StorageService } from '../../storage/storage.service';
import { mock } from 'node:test';

const mockUserRepository = () => ({
  isPasswordValid: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  updateById: jest.fn(),
  updateByEmail: jest.fn(),
  findAll: jest.fn(),
  findAllByFilter: jest.fn(),
  findOne: jest.fn(),
});

const mockRoleRepository = () => ({});
const mockResetPasswordTokenRepository = () => ({});
const mockAuthenticationTokenRepository = () => ({});
const mockEmailService = () => ({});
const mockStorageService = () => ({});

const mockUserMapper = () => ({
  entitiesToModels: jest.fn(),
  entityToModel: jest.fn(),
});

const mockResetPasswordTokenMapper = () => ({
  resetPasswordTokenEntityToModel: jest.fn(),
});

const now = new Date();
const uuid1 = randomUUID();
const uuid2 = randomUUID();

const mockUser: UserModel = {
  id: 1,
  uuid: uuid1,
  name: 'Test user',
  email: 'test@test.com',
  password: 'testpass',
  role: Role.ADMIN,
  isActive: true,
  imageId: 'imageId1',
  imageUrl: 'imageUrl1',
  createdAt: now,
  updatedAt: now,
};

const mockUserEntity: UserWithRole = {
  id: 1,
  uuid: uuid2,
  name: 'Test user',
  email: 'test@test.com',
  password: 'testpass',
  isActive: true,
  imageId: 'imageId2',
  imageUrl: 'imageUrl2',
  createdAt: now,
  updatedAt: now,
  roleId: 1,
  role: {
    id: 1,
    name: 'ADMIN',
    description: 'Admin',
  },
};

const transportOptions = {
  host: 'host',
  port: 55,
  secure: false,
  auth: {
    user: 'test user',
    pass: 'testpass',
  },
};

describe('UserService', () => {
  let userService: UserService;
  let emailService: EmailService;
  let storageService: StorageService;
  let userRepository;
  let roleRepository;
  let userMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot({
          transport: transportOptions,
          defaults: {
            from: 'test from',
          },
          template: {
            dir: './templates',
            adapter: undefined,
            options: {
              strict: true,
            },
          },
        }),
      ],
      providers: [
        UserService,
        { provide: EmailService, useFactory: mockEmailService },
        { provide: StorageService, useFactory: mockStorageService },
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: RoleRepository, useFactory: mockRoleRepository },
        { provide: ResetPasswordTokenRepository, useFactory: mockResetPasswordTokenRepository },
        { provide: AuthenticationTokenRepository, useFactory: mockAuthenticationTokenRepository },
        { provide: UserMapper, useFactory: mockUserMapper },
        { provide: ResetPasswordTokenMapper, useFactory: mockResetPasswordTokenMapper },
        // { provide: StorageService, useFactory: mockStorageService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
    storageService = module.get<StorageService>(StorageService);
    userRepository = module.get<UserRepository>(UserRepository);
    roleRepository = module.get<RoleRepository>(RoleRepository);
    userMapper = module.get<UserMapper>(UserMapper);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all users from the repository', async () => {
      // const { password, ...expected } = mockUser;
      const expectedUsers = [mockUser];

      const entitiesPageable: PageModel<UserWithRole> = {
        elements: [mockUserEntity],
        totalElements: 1,
      };
      userRepository.findAll.mockResolvedValue(entitiesPageable);
      userMapper.entitiesToModels.mockReturnValue([mockUser]);

      const getUserDto: GetUsersDto = {
        role: Role.USER,
        page: 1,
        pageSize: 5,
      };
      const results = await userService.findAll(getUserDto);

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(userMapper.entitiesToModels).toHaveBeenCalledWith([mockUserEntity]);
      expect(results.totalElements).toEqual(1);
      expect(results.elements).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should find user by ID from the repository', async () => {
      // const { password, updatedAt, createdAt, ...expected } = mockUser;

      userRepository.findOne.mockResolvedValue(mockUserEntity);
      userMapper.entityToModel.mockReturnValue(mockUser);

      const result = await userService.findByUuid(uuid1);

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userMapper.entityToModel).toHaveBeenCalledWith(mockUserEntity);
      expect(result).toEqual(mockUser);
    });

    it('should throw exception if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const uuid = randomUUID();
      expect(userService.findByUuid(uuid)).rejects.toThrow(NotFoundException);
    });
  });
});
