import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SESSION_CONFIG } from './auth.tokens.js';
import { PasswordAuthController } from './password-auth.controller.js';
import { PasswordAuthService } from './password-auth.service.js';
import { PasswordHasher } from './password-hasher.js';
import type { SessionConfig } from './session.js';
import { SessionGuard } from './session.guard.js';
import { SessionStore } from './session.store.js';

/** Sessions and the auth endpoints. Exports the guard and store for other protected modules. */
@Module({
  imports: [UsersModule],
  controllers: [AuthController, PasswordAuthController],
  providers: [
    {
      provide: SESSION_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): SessionConfig => ({
        idleTtlSeconds: config.get('SESSION_IDLE_TTL_SECONDS', { infer: true }),
        absoluteTtlSeconds: config.get('SESSION_ABSOLUTE_TTL_SECONDS', { infer: true }),
      }),
    },
    SessionStore,
    SessionGuard,
    AuthService,
    PasswordHasher,
    PasswordAuthService,
  ],
  exports: [SessionStore, SessionGuard],
})
export class AuthModule {}
