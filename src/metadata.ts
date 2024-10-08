/* eslint-disable */
export default async () => {
  const t = {
    ['./user/model/role.model']: await import('./user/model/role.model'),
    ['./user/model/language-code.model']: await import('./user/model/language-code.model'),
    ['./user/model/user.model']: await import('./user/model/user.model'),
    ['./authentication/model/login.model']: await import('./authentication/model/login.model'),
    ['./shared/model/message.model']: await import('./shared/model/message.model'),
  };
  return {
    '@nestjs/swagger/plugin': {
      models: [
        [
          import('./user/dto/create.user.dto'),
          {
            CreateUserDto: {
              email: { required: true, type: () => String },
              name: { required: true, type: () => String, maxLength: 100 },
              role: { required: true, enum: t['./user/model/role.model'].Role },
            },
          },
        ],
        [
          import('./user/dto/filter.user.dto'),
          {
            FilterUserDto: {
              active: { required: false, type: () => Boolean },
              id: { required: false, type: () => Number },
              uuid: { required: false },
              email: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./user/dto/filter.users.dto'),
          {
            FilterUsersDto: {
              active: { required: false, type: () => Boolean },
              role: { required: false, enum: t['./user/model/role.model'].Role },
              langCode: { required: false, enum: t['./user/model/language-code.model'].LanguageCode },
              emails: { required: false, type: () => [String] },
            },
          },
        ],
        [
          import('./user/dto/get.users.dto'),
          {
            GetUsersDto: {
              role: { required: true, enum: t['./user/model/role.model'].Role },
              page: { required: true, type: () => Number },
              pageSize: { required: true, type: () => Number },
            },
          },
        ],
        [
          import('./user/dto/update.user.entity.dto'),
          {
            UpdateUserEntityDto: {
              email: { required: false, type: () => String },
              password: { required: false, type: () => String },
              name: { required: false, type: () => String },
              isActive: { required: false, type: () => Boolean },
              roleId: { required: false, type: () => Number, minimum: 1 },
              imageId: { required: false, type: () => String },
              imageUrl: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./storage/file.dto'),
          {
            FileDto: {
              fileUrl: { required: true, type: () => String },
              fileId: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./user/dto/register.dto'),
          {
            RegisterDto: {
              email: { required: true, type: () => String },
              name: { required: true, type: () => String, maxLength: 100 },
              password: { required: true, type: () => String, minLength: 8 },
            },
          },
        ],
        [
          import('./user/dto/update.profile.dto'),
          {
            UpdateProfileDto: {
              password: { required: false, type: () => String, minLength: 8 },
              name: { required: false, type: () => String, maxLength: 100 },
            },
          },
        ],
        [
          import('./user/dto/update.user.dto'),
          {
            UpdateUserDto: {
              email: { required: false, type: () => String },
              password: { required: false, type: () => String, minLength: 8 },
              name: { required: false, type: () => String, maxLength: 100 },
              active: { required: false, type: () => Boolean },
              role: { required: false, enum: t['./user/model/role.model'].Role },
            },
          },
        ],
        [
          import('./authentication/dto/login.dto'),
          {
            LoginDto: {
              password: { required: true, type: () => String },
              email: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./authentication/dto/forgot.password.dto'),
          { ForgotPasswordDto: { email: { required: true, type: () => String } } },
        ],
        [
          import('./authentication/dto/reset.password.dto'),
          {
            ResetPasswordDto: {
              password: { required: true, type: () => String, minLength: 8, maxLength: 20 },
              token: { required: true, type: () => String },
            },
          },
        ],
      ],
      controllers: [
        [
          import('./authentication/controller/authentication.controller'),
          {
            AuthenticationController: {
              register: { type: t['./user/model/user.model'].UserModel },
              login: { type: t['./authentication/model/login.model'].LoginModel },
              logout: {},
              refreshToken: { type: t['./authentication/model/login.model'].LoginModel },
            },
          },
        ],
        [
          import('./authentication/controller/index.controller'),
          { IndexController: { welcome: {}, info: {}, redirect: {} } },
        ],
        [
          import('./authentication/controller/reset.password.controller'),
          {
            ResetPasswordController: {
              forgotPassword: { type: t['./shared/model/message.model'].MessageModel },
              findUserByToken: { type: t['./user/model/user.model'].UserModel },
              resetPassword: { type: t['./user/model/user.model'].UserModel },
            },
          },
        ],
        [
          import('./user/controller/profile.controller'),
          {
            ProfileController: {
              getProfile: { type: t['./user/model/user.model'].UserModel },
              updateProfile: { type: t['./user/model/user.model'].UserModel },
              updateProfileImage: { type: t['./user/model/user.model'].UserModel },
            },
          },
        ],
        [
          import('./user/controller/user.controller'),
          {
            UserController: {
              createUser: { type: t['./user/model/user.model'].UserModel },
              findUsers: {},
              findUserByUuid: { type: t['./user/model/user.model'].UserModel },
              updateUserByUuid: { type: t['./user/model/user.model'].UserModel },
              deleteUserByUuid: { type: t['./user/model/user.model'].UserModel },
            },
          },
        ],
      ],
    },
  };
};
