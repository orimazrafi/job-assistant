import { PASSWORD_MIN, signupSchema } from '@job-assistant/shared';
import { CredentialsForm } from './CredentialsForm';
import { useSignup } from './useAuthMutations';

/** Sign-up form. On success the new user is signed in and GuestRoute redirects. */
export function SignupForm() {
  const signup = useSignup();

  return (
    <CredentialsForm
      schema={signupSchema}
      submitLabel="Create account"
      pendingLabel="Creating account…"
      passwordAutoComplete="new-password"
      passwordHint={`At least ${PASSWORD_MIN} characters.`}
      onSubmit={(values) => signup.mutate(values)}
      isPending={signup.isPending}
      serverError={signup.error?.message}
    />
  );
}
