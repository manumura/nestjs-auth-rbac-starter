import { UnauthorizedException } from '@nestjs/common';

export class RefreshTokenException extends UnauthorizedException {
  constructor() {
    super('Unauthorized: invalid refresh token');
  }
}
