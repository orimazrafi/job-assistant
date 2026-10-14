import { zodResolver } from '@hookform/resolvers/zod';
import type { CredentialsRequest } from '@job-assistant/shared';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

interface CredentialsFormProps {
  /** Shared schema from `@job-assistant/shared`; the API validates with the same one. */
  schema: z.ZodType<CredentialsRequest, CredentialsRequest>;
  submitLabel: string;
  pendingLabel: string;
  /** Lets password managers offer a saved password (login) or generate a new one (sign-up). */
  passwordAutoComplete: 'current-password' | 'new-password';
  passwordHint?: string;
  onSubmit: (values: CredentialsRequest) => void;
  isPending: boolean;
  /** Message from the API (wrong credentials, email taken, server down). */
  serverError?: string;
}

/**
 * Email and password form used by login and sign-up. react-hook-form keeps the inputs uncontrolled
 * (no re-render per keystroke) and validates with the zod schema on submit, then per field as the
 * user fixes it. Field errors are linked to their inputs for screen readers.
 */
export function CredentialsForm({
  schema,
  submitLabel,
  pendingLabel,
  passwordAutoComplete,
  passwordHint,
  onSubmit,
  isPending,
  serverError,
}: CredentialsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsRequest>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        aria-invalid={errors.email ? true : undefined}
        aria-describedby={errors.email ? 'email-error' : undefined}
        {...register('email')}
      />
      {errors.email && (
        <p id="email-error" className="field-error">
          {errors.email.message}
        </p>
      )}

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        autoComplete={passwordAutoComplete}
        aria-invalid={errors.password ? true : undefined}
        aria-describedby={errors.password ? 'password-error' : passwordHint ? 'password-hint' : undefined}
        {...register('password')}
      />
      {errors.password ? (
        <p id="password-error" className="field-error">
          {errors.password.message}
        </p>
      ) : (
        passwordHint && (
          <p id="password-hint" className="field-hint">
            {passwordHint}
          </p>
        )
      )}

      {serverError && (
        <p role="alert" className="form-error">
          {serverError}
        </p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
