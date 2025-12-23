import { Prisma } from './generated/client';

// Types for User with relations
export type AuthenticationTokenWithUser = Prisma.AuthenticationTokenGetPayload<{
  include: {
    user: {
      include: {
        role: true;
      };
    };
  };
}>;

export type UserWithRole = Prisma.UserGetPayload<{
  include: {
    role: true;
  };
}>;

export type UserWithRoleAndCredentials = Prisma.UserGetPayload<{
  include: {
    role: true;
    credentials: true;
  };
}>;

export type UserWithRoleAndOauthProviders = Prisma.UserGetPayload<{
  include: {
    role: true;
    oauthProviders: true;
  };
}>;

export type UserWithRoleCredentialsAndOauthProviders = Prisma.UserGetPayload<{
  include: {
    role: true;
    credentials: true;
    oauthProviders: {
      select: {
        externalUserId: true;
        email: true;
        oauthProvider: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;
