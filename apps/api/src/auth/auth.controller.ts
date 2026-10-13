import { Controller, Get, UseGuards } from '@nestjs/common';
import type { CurrentUserResponse } from '@job-assistant/shared';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import type { AuthContext } from './session.js';
import { SessionGuard } from './session.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** `GET /api/auth/me`: 200 with the signed-in user, or 401 when there is no valid session. */
  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentUser() auth: AuthContext): Promise<CurrentUserResponse> {
    return this.auth.getCurrentUser(auth);
  }
}
