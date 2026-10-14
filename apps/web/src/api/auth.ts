import type { CredentialsRequest, CurrentUserResponse } from '@job-assistant/shared';
import { ApiError, requestJson, sendJson } from './http';

/** `GET /api/auth/me`. Resolves to null when signed out (401), so "signed out" is data, not an error. */
export async function fetchCurrentUser(): Promise<CurrentUserResponse | null> {
  try {
    return await requestJson<CurrentUserResponse>('/api/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/** `POST /api/auth/signup`. Sets the session cookie; rejects with ApiError(409) if the email is taken. */
export function signup(credentials: CredentialsRequest): Promise<CurrentUserResponse> {
  return sendJson<CurrentUserResponse>('/api/auth/signup', credentials);
}

/** `POST /api/auth/login`. Sets a new session cookie; rejects with ApiError(401) for wrong credentials. */
export function login(credentials: CredentialsRequest): Promise<CurrentUserResponse> {
  return sendJson<CurrentUserResponse>('/api/auth/login', credentials);
}

/** `POST /api/auth/logout`. Ends the session and deletes the cookie; always succeeds (204). */
export async function logout(): Promise<void> {
  await sendJson<null>('/api/auth/logout');
}
