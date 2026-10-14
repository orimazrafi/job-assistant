import { loginSchema } from '@job-assistant/shared';
import { CredentialsForm } from './CredentialsForm';
import { useLogin } from './useAuthMutations';

/** Login form. On success the user is stored and GuestRoute redirects; errors come from the API. */
export function LoginForm() {
  const login = useLogin();

  return (
    <CredentialsForm
      schema={loginSchema}
      submitLabel="Log in"
      pendingLabel="Logging in…"
      passwordAutoComplete="current-password"
      onSubmit={(values) => login.mutate(values)}
      isPending={login.isPending}
      serverError={login.error?.message}
    />
  );
}
