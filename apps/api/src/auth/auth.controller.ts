import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { CurrentUserResponse } from '@job-assistant/shared';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { clearSessionCookie, readSessionId } from './cookie.js';
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

  /**
   * `POST /api/auth/logout`: 204 always, so it is safe to repeat. Ends the session if the cookie
   * names one and deletes the cookie. No guard: an expired session should still clear the cookie.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const sessionId = readSessionId(req.headers.cookie);
    if (sessionId) await this.auth.logout(sessionId);
    clearSessionCookie(res);
  }
}
