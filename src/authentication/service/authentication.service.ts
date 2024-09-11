import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bfj from 'bfj';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { FilterUserDto } from 'src/user/dto/filter.user.dto';
import { UserWithRole } from '../../../prisma/custom-types';
import { appConfig } from '../../config/config';
import { UserMapper } from '../../user/mapper/user.mapper';
import { UserModel } from '../../user/model/user.model';
import { UserRepository } from '../../user/repository/user.repository';
import { LoginDto } from '../dto/login.dto';
import { GoogleOauth2LoginDto } from '../dto/oauth2.login.dto';
import { OauthProvider } from '../dto/provider';
import { LoginModel } from '../model/login.model';
import { TokenModel } from '../model/token.model';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';
import { RoleRepository } from '../../user/repository/role.repository';
import { Role } from '../../user/model/role.model';
import { OauthProviderRepository } from '../../user/repository/oauth-provider.repository';

@Injectable()
export class AuthenticationService {
  private logger = new Logger('AuthenticationService');

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly oauthProviderRepository: OauthProviderRepository,
    private readonly authenticationTokenRepository: AuthenticationTokenRepository,
    private readonly userMapper: UserMapper,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginData: LoginDto): Promise<LoginModel> {
    const { email, password } = loginData;
    if (!email || !password) {
      throw new BadRequestException('Email or password undefined');
    }

    const filter: FilterUserDto = {
      email,
      active: true,
    };
    const userEntity = await this.userRepository.findOne(filter);
    if (!userEntity) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await this.userRepository.isPasswordValid(password, userEntity.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenModel = await this.generateAuthenticationTokens(userEntity);
    const user = this.userMapper.entityToModel(userEntity);
    const json = await bfj.stringify(user);
    this.logger.debug(`User logged in: ${json}`);

    const loginModel: LoginModel = {
      accessToken: tokenModel.accessToken,
      accessTokenExpiresAt: tokenModel.accessTokenExpiryDate,
      refreshToken: tokenModel.refreshToken,
      idToken: this.generateIdToken(user),
    };
    return loginModel;
  }

  async logout(userId: number | undefined): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID undefined');
    }
    this.authenticationTokenRepository.remove(userId);
  }

  async refreshToken(userId: number | undefined): Promise<LoginModel> {
    if (!userId) {
      throw new BadRequestException('User ID undefined');
    }

    const filter: FilterUserDto = {
      id: userId,
      active: true,
    };
    const userEntity = await this.userRepository.findOne(filter);
    if (!userEntity) {
      throw new NotFoundException(`User not found with ID: ${userId}`);
    }

    const tokenModel = await this.generateAuthenticationTokens(userEntity);
    const user = this.userMapper.entityToModel(userEntity);
    const json = await bfj.stringify(user);
    this.logger.debug(`User refresh token: ${json}`);

    const loginModel: LoginModel = {
      accessToken: tokenModel.accessToken,
      accessTokenExpiresAt: tokenModel.accessTokenExpiryDate,
      refreshToken: tokenModel.refreshToken,
      idToken: this.generateIdToken(user),
    };
    return loginModel;
  }

  private async generateAuthenticationTokens(userEntity: UserWithRole): Promise<TokenModel> {
    if (!userEntity) {
      throw new BadRequestException('User entity undefined when trying to create access token');
    }

    const accessToken = nanoid();
    const accessTokenExpiryDate = this.getAccessTokenExpiryDate();
    const refreshToken = nanoid();
    const refreshokenExpiryDate = this.getRefreshTokenExpiryDate();

    const authenticationTokenEntityCreated = await this.authenticationTokenRepository.generate(
      accessToken,
      accessTokenExpiryDate,
      refreshToken,
      refreshokenExpiryDate,
      userEntity.id,
    );
    if (!authenticationTokenEntityCreated) {
      throw new InternalServerErrorException('Authentication tokens creation failed');
    }

    const tokenModel: TokenModel = {
      accessToken,
      accessTokenExpiryDate,
      refreshToken,
    };

    this.logger.debug(`Access token created for user ID ${userEntity.id}: ${JSON.stringify(tokenModel)}`);
    return tokenModel;
  }

  private generateIdToken(user: UserModel): string {
    return this.jwtService.sign(
      { user },
      {
        // subject: user.id,
        expiresIn: appConfig.ID_TOKEN_EXPIRES_IN_AS_SECONDS,
      },
    );
  }

  private getAccessTokenExpiryDate(): Date {
    const now = moment().utc();
    return now.add(appConfig.ACCESS_TOKEN_EXPIRES_IN_AS_SECONDS, 'seconds').toDate();
  }

  private getRefreshTokenExpiryDate(): Date {
    const now = moment().utc();
    return now.add(appConfig.REFRESH_TOKEN_EXPIRES_IN_AS_SECONDS, 'seconds').toDate();
  }

  // TODO email password to separate table
  async googleOauth2Login(googleOauth2LoginDto: GoogleOauth2LoginDto): Promise<LoginModel> {
    try {
      const { token } = googleOauth2LoginDto;
      const googleUser = await this.verifyGoogleToken(token);
      this.logger.log(`Google oauth2 login user: ${JSON.stringify(googleUser)}`);
      if (!googleUser) {
        throw new UnauthorizedException('Invalid Google oauth2 user');
      }

      const roleEntity = await this.roleRepository.findByName(Role.USER);
      if (!roleEntity) {
        throw new NotFoundException(`Role not found by name: ${Role.USER}`);
      }

      const oauthProviderEntity = await this.oauthProviderRepository.findByName(OauthProvider.Google);
      if (!oauthProviderEntity) {
        throw new NotFoundException(`Oauth provider not found by name: ${OauthProvider.Google}`);
      }

      let userEntity = await this.userRepository.findOneOauth({
        oauthProviderId: oauthProviderEntity.id,
        externalUserId: googleUser.sub,
      });

      if (!userEntity) {
        userEntity = await this.userRepository.createOauth(
          googleUser.email ? OauthProvider.Google + '#' + googleUser.email : 'N/A#' + googleUser.sub,
          googleUser.name ?? 'N/A',
          roleEntity.id,
          oauthProviderEntity.id,
          googleUser.sub,
        );
      }
      if (!userEntity) {
        throw new UnauthorizedException('Oauth2 login failed');
      }

      const tokenModel = await this.generateAuthenticationTokens(userEntity);
      const user = this.userMapper.entityToModel(userEntity);
      const json = await bfj.stringify(user);
      this.logger.debug(`User refresh token: ${json}`);

      const loginModel: LoginModel = {
        accessToken: tokenModel.accessToken,
        accessTokenExpiresAt: tokenModel.accessTokenExpiryDate,
        refreshToken: tokenModel.refreshToken,
        idToken: this.generateIdToken(user),
      };
      return loginModel;
    } catch (error) {
      this.logger.error('Google oauth2 login failed', error.stack);
      throw new InternalServerErrorException('Oauth2 login failed: ' + error.message);
    }
  }

  private async verifyGoogleToken(token: string) {
    const clientId = appConfig.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    return payload;
  }
}
