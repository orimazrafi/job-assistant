import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, logout, signup } from '../../api/auth';
import { authKeys } from './queryKeys';

/** Owns the login mutation; on success stores the user as "who is signed in". */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: login, onSuccess: (user) => queryClient.setQueryData(authKeys.me, user) });
}

/** Owns the sign-up mutation; on success the new user is signed in. */
export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: signup, onSuccess: (user) => queryClient.setQueryData(authKeys.me, user) });
}

/**
 * Owns the logout mutation. On success drops every cached query except auth (so the next user
 * never sees this user's data), then marks the user as signed out; route guards redirect from there.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.me[0] });
      queryClient.setQueryData(authKeys.me, null);
    },
  });
}
