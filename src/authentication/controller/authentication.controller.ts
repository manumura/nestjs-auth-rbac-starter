import { Body, Controller, HttpCode, Logger, Post, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { appConstants } from '../../app.constants';
import { COOKIE_OPTIONS } from '../../config/cookie.config';
import { GetUser } from '../../shared/decorator/get-user.decorator';
import { RegisterDto } from '../../user/dto/register.dto';
import { UserModel } from '../../user/model/user.model';
import { UserService } from '../../user/service/user.service';
import { LoginDto } from '../dto/login.dto';
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
    return this.userService.register(registerDto);
  }

  @Post('/v1/login')
  @HttpCode(200)
  @ApiOkResponse({ type: LoginModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async login(@Body(ValidationPipe) loginData: LoginDto, @Res({ passthrough: true }) response: FastifyReply): Promise<LoginModel> {
    const login = await this.authenticationService.login(loginData);
    this.setAuthCookies(response, login);
    return login;
  }

  @Post('/v1/logout')
  @HttpCode(200)
  @UseGuards(LogoutGuard, UserActiveGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  logout(@GetUser() user: UserModel, @Res({ passthrough: true }) response: FastifyReply): Promise<void> {
    this.logger.log(`User with email ${user.email} logged out`);
    this.clearAuthCookies(response);
    return this.authenticationService.logout(user.id);
  }

  @Post('/v1/refresh-token')
  @HttpCode(200)
  @UseGuards(RefreshTokenGuard, UserActiveGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: LoginModel })
  async refreshToken(@GetUser() user: UserModel, @Res({ passthrough: true }) response: FastifyReply): Promise<LoginModel> {
    this.logger.log(`Refresh token for user with email ${user.email}`);
    const login = await this.authenticationService.refreshToken(user.id);
    this.setAuthCookies(response, login);
    return login;
  }

  private setAuthCookies(response: FastifyReply, login: LoginModel) {
    response.setCookie(appConstants.ACCESS_TOKEN_NAME, login.accessToken, COOKIE_OPTIONS);
    response.setCookie(appConstants.REFRESH_TOKEN_NAME, login.refreshToken, COOKIE_OPTIONS);
  }

  private clearAuthCookies(response: FastifyReply) {
    response.clearCookie(appConstants.ACCESS_TOKEN_NAME, COOKIE_OPTIONS);
    response.clearCookie(appConstants.REFRESH_TOKEN_NAME, COOKIE_OPTIONS);
  }
}
