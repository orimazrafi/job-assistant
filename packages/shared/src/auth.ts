/** Response body of `GET /api/auth/me`: the signed-in user, without secrets. */
export interface CurrentUserResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}
