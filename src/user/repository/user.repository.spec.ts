import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UserWithRoleCredentialsAndOauthProviders } from 'prisma/custom-types';
import { PrismaService } from '../../../prisma/prisma.service';
import { FilterUserDto } from '../dto/filter.user.dto';
import { GetUsersDto } from '../dto/get.users.dto';
import { Role as RoleEnum } from '../model/role.model';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let userRepository;
  let roleRepository;

  const now = new Date();

  const mockRoleEntity: Role = {
    id: 1,
    name: RoleEnum.ADMIN,
    description: 'user role',
  };

  const uuid1 = randomUUID();
  const uuid2 = randomUUID();

  const mockUserEntity1: UserWithRoleCredentialsAndOauthProviders = {
    id: 1,
    uuid: uuid1,
    name: 'Test user',
    role: mockRoleEntity,
    isActive: true,
    imageId: 'imageId1',
    imageUrl: 'imageUrl1',
    createdAt: now,
    updatedAt: now,
    roleId: 1,
    credentials: {
      email: 'test@test.com',
      password: 'testpass',
      isEmailVerified: true,
      userId: 1,
    },
    oauthProviders: [],
  };

  const mockUserEntity2: UserWithRoleCredentialsAndOauthProviders = {
    id: 2,
    uuid: uuid2,
    name: 'Test2 user',
    role: mockRoleEntity,
    isActive: true,
    imageId: 'imageId2',
    imageUrl: 'imageUrl2',
    createdAt: now,
    updatedAt: now,
    roleId: 1,
    credentials: {
      email: 'test2@test2.com',
      password: 'testpass2',
      isEmailVerified: true,
      userId: 2,
    },
    oauthProviders: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    userRepository = module.get(UserRepository);
    prisma = module.get(PrismaService);
  });

  it('should find all users', async () => {
    const mockUsers = [mockUserEntity1, mockUserEntity2];
    prisma.user.findMany.mockResolvedValueOnce(mockUsers);
    prisma.user.count.mockResolvedValueOnce(mockUsers.length);

    const getUserDto: GetUsersDto = {
      role: RoleEnum.ADMIN,
      page: 1,
      pageSize: 5,
    };
    const usersPageModel = await userRepository.findAll(getUserDto);

    expect(usersPageModel.totalElements).toBe(2);
    expect(usersPageModel.elements[0].name).toBe('Test user');
    expect(usersPageModel.elements[1].name).toBe('Test2 user');
  });

  it('should find user by ID', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(mockUserEntity1);

    const filter: FilterUserDto = {
      id: 1,
    };
    const user = await userRepository.findOne(filter);
    expect(user.name).toBe('Test user');
  });

  it('should find active user by email', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(mockUserEntity1);

    const filter: FilterUserDto = {
      email: 'test@test.com',
      active: true,
    };
    const user = await userRepository.findOne(filter);
    expect(user.name).toBe('Test user');
  });

  afterAll(() => {
    console.log('afterAll');
  });
});
