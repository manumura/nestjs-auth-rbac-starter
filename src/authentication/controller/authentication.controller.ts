import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { GetUser } from '../../shared/decorator/get-user.decorator';
import { clearAuthCookies, setAuthCookies } from '../../shared/util/cookies';
import { RegisterDto } from '../../user/dto/register.dto';
import { AuthenticatedUserModel } from '../../user/model/authenticated.user.model';
import { UserModel } from '../../user/model/user.model';
import { UserService } from '../../user/service/user.service';
import { LoginDto } from '../dto/login.dto';
import { Oauth2FacebookLoginDto } from '../dto/oauth2.facebook.login.dto';
import { Oauth2GoogleLoginDto } from '../dto/oauth2.google.login.dto';
import { LogoutGuard } from '../guard/logout.guard';
import { RefreshTokenGuard } from '../guard/refresh.token.guard';
import { UserActiveGuard } from '../guard/user.active.guard';
import { LoginModel } from '../model/login.model';
import { AuthenticationService } from '../service/authentication.service';

@Controller()
export class AuthenticationController {
  private logger = new Logger('AuthenticationController');

  constructor(
    private readonly userService: UserService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Post('/v1/register')
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: UserModel,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<UserModel> {
    this.logger.log(`Register user with email ${registerDto.email}`);
    return this.userService.register(registerDto);
  }

  @Post('/v1/login')
  @HttpCode(200)
  @ApiOkResponse({ type: LoginModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<LoginModel> {
    this.logger.log(`Login user with email ${loginDto.email}`);
    const login = await this.authenticationService.login(loginDto);
    // https://docs.nestjs.com/techniques/cookies
    setAuthCookies(response, login);
    return login;
  }

  @Post('/v1/logout')
  @HttpCode(204)
  @UseGuards(LogoutGuard, UserActiveGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  async logout(
    @GetUser() currentUser: AuthenticatedUserModel,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<UserModel> {
    this.logger.log(`User ${currentUser.uuid} logged out`);
    if (!currentUser?.uuid) {
      throw new BadRequestException('User UUID is required');
    }
    clearAuthCookies(response);
    return await this.authenticationService.logout(currentUser.uuid);
  }

  @Post('/v1/refresh-token')
  @HttpCode(200)
  @UseGuards(RefreshTokenGuard, UserActiveGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: LoginModel })
  async refreshToken(
    @GetUser() currentUser: AuthenticatedUserModel,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<LoginModel> {
    this.logger.log(`Refresh token for user ${currentUser.uuid}`);
    if (!currentUser?.uuid) {
      throw new BadRequestException('User UUID is required');
    }
    const loginModel = await this.authenticationService.refreshToken(currentUser.uuid);
    setAuthCookies(response, loginModel);
    return loginModel;
  }

  @Post('/v1/oauth2/google')
  @HttpCode(200)
  @ApiOkResponse({ type: LoginModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async oauth2GoogleLogin(
    @Body(ValidationPipe) oauth2GoogleLoginDto: Oauth2GoogleLoginDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<LoginModel> {
    this.logger.log('Google Oauth2 login');
    const loginModel = await this.authenticationService.oauth2GoogleLogin(oauth2GoogleLoginDto);
    setAuthCookies(response, loginModel);
    return loginModel;
  }

  // TODO email verification
  @Post('/v1/oauth2/facebook')
  @HttpCode(200)
  @ApiOkResponse({ type: LoginModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async oauth2FacebookLogin(
    @Body(ValidationPipe) oauth2FacebookLogin: Oauth2FacebookLoginDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<LoginModel> {
    this.logger.log('Facebook Oauth2 login');
    const loginModel = await this.authenticationService.oauth2FacebookLogin(oauth2FacebookLogin);
    setAuthCookies(response, loginModel);
    return loginModel;
  }
}
