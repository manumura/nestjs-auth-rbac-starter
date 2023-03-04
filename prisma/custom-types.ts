import { Prisma } from '@prisma/client';

const authenticationTokenWithUser = Prisma.validator<Prisma.AuthenticationTokenArgs>()({
  include: {
    user: {
      include: {
        role: true,
      },
    },
  },
});

export type AuthenticationTokenWithUser = Prisma.AuthenticationTokenGetPayload<typeof authenticationTokenWithUser>;

const userWithRole = Prisma.validator<Prisma.UserArgs>()({
  include: {
    role: true,
  },
});

export type UserWithRole = Prisma.UserGetPayload<typeof userWithRole>;
