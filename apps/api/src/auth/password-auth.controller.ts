import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { loginSchema, signupSchema, type CredentialsRequest, type CurrentUserResponse } from '@job-assistant/shared';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../http/zod-validation.pipe.js';
import { SESSION_CONFIG } from './auth.tokens.js';
import { readSessionId, setSessionCookie } from './cookie.js';
import { PasswordAuthService, type SignedIn } from './password-auth.service.js';
import type { SessionConfig } from './session.js';

/** Email and password endpoints. Both set a fresh session cookie and return the user. */
@Controller('auth')
export class PasswordAuthController {
  constructor(
    private readonly passwordAuth: PasswordAuthService,
    @Inject(SESSION_CONFIG) private readonly config: SessionConfig,
  ) {}

  /** `POST /api/auth/signup`: 201 and signed in, 400 for an invalid body, 409 if the email is taken. */
  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) body: CredentialsRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CurrentUserResponse> {
    const previousSessionId = readSessionId(req.headers.cookie);
    const signedIn = await this.passwordAuth.signup(body, previousSessionId);
    return this.respond(res, signedIn);
  }

  /** `POST /api/auth/login`: 200 and signed in, 400 for an invalid body, 401 for wrong credentials. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: CredentialsRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CurrentUserResponse> {
    const previousSessionId = readSessionId(req.headers.cookie);
    const signedIn = await this.passwordAuth.login(body, previousSessionId);
    return this.respond(res, signedIn);
  }

  /** Sets the session cookie for the whole absolute lifetime (Redis enforces the idle limit) and returns the user. */
  private respond(res: Response, { user, session }: SignedIn): CurrentUserResponse {
    setSessionCookie(res, session.id, this.config.absoluteTtlSeconds);
    return user;
  }
}
