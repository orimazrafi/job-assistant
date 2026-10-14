/** Request body of `POST /api/auth/signup` and `POST /api/auth/login`. */
export interface CredentialsRequest {
  email: string;
  password: string;
}

/** Response body of `GET /api/auth/me`, signup, and login: the signed-in user, without secrets. */
export interface CurrentUserResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}
