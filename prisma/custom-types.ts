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
