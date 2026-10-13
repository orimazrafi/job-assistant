import type { Request } from 'express';

/** A signed-in browser session, stored in Redis under `sess:<id>`. Times are epoch milliseconds. */
export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastSeenAt: number;
}

/** Session lifetimes from env: ends after `idleTtlSeconds` unused or `absoluteTtlSeconds` after login. */
export interface SessionConfig {
  idleTtlSeconds: number;
  absoluteTtlSeconds: number;
}

/** Who is making the request; set by SessionGuard, read with the @CurrentUser() decorator. */
export interface AuthContext {
  userId: string;
  sessionId: string;
}

/** An Express request that passed SessionGuard. */
export type AuthenticatedRequest = Request & { auth: AuthContext };
