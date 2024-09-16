import { Prisma } from '@prisma/client';

const authenticationTokenWithUser = Prisma.validator<Prisma.AuthenticationTokenDefaultArgs>()({
  include: {
    user: {
      include: {
        role: true,
      },
    },
  },
});

export type AuthenticationTokenWithUser = Prisma.AuthenticationTokenGetPayload<typeof authenticationTokenWithUser>;

const userWithRole = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    role: true,
  },
});

export type UserWithRole = Prisma.UserGetPayload<typeof userWithRole>;

const userWithRoleAndCredentials = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    role: true,
    credentials: true,
  },
});

export type UserWithRoleAndCredentials = Prisma.UserGetPayload<typeof userWithRoleAndCredentials>;

const userWithRoleAndOauthProviders = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    role: true,
    oauthProviders: true,
  },
});

export type UserWithRoleAndOauthProviders = Prisma.UserGetPayload<typeof userWithRoleAndOauthProviders>;

const userWithRoleCredentialsAndOauthProviders = Prisma.validator<Prisma.UserDefaultArgs>()({
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

export type UserWithRoleCredentialsAndOauthProviders = Prisma.UserGetPayload<
  typeof userWithRoleCredentialsAndOauthProviders
>;
