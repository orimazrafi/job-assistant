import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../../AppRoutes';
import { renderWithRouter, stubFetchRoutes } from '../../test/render';

const dana = { id: 'user-1', email: 'dana@example.com', emailVerified: false, createdAt: '2026-01-01T00:00:00.000Z' };
const signedOut = { status: 401, body: { statusCode: 401, error: 'NotAuthenticatedError', message: 'Not signed in' } };

/** Waits for the form (shown once the session check is done), fills it, and submits with `button`. */
async function submitCredentials(email: string, password: string, button: string) {
  await userEvent.type(await screen.findByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: button }));
}

describe('protected home page', () => {
  it('sends a signed-out visitor to the login page', async () => {
    stubFetchRoutes({ 'GET /api/auth/me': signedOut });

    renderWithRouter(<AppRoutes />, '/');

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('shows the signed-in user', async () => {
    stubFetchRoutes({ 'GET /api/auth/me': { status: 200, body: dana } });

    renderWithRouter(<AppRoutes />, '/');

    expect(await screen.findByText('dana@example.com')).toBeInTheDocument();
  });

  it('logs out and returns to the login page', async () => {
    const fetchMock = stubFetchRoutes({
      'GET /api/auth/me': { status: 200, body: dana },
      'POST /api/auth/logout': { status: 204 },
    });
    renderWithRouter(<AppRoutes />, '/');

    await userEvent.click(await screen.findByRole('button', { name: 'Log out' }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST' }));
  });
});

describe('login page', () => {
  it('logs in and opens the page the user was going to', async () => {
    const fetchMock = stubFetchRoutes({
      'GET /api/auth/me': signedOut,
      'POST /api/auth/login': { status: 200, body: dana },
      'GET /api/health': { status: 200, body: { status: 'ok', checks: [] } },
    });
    renderWithRouter(<AppRoutes />, '/login?next=%2Fstatus');

    await submitCredentials('  dana@example.com ', 'correct horse battery', 'Log in');

    expect(await screen.findByRole('heading', { name: /System status/ })).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls.find(([path]) => path === '/api/auth/login')!;
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'dana@example.com', password: 'correct horse battery' });
  });

  it('shows the server message for wrong credentials', async () => {
    stubFetchRoutes({
      'GET /api/auth/me': signedOut,
      'POST /api/auth/login': {
        status: 401,
        body: { statusCode: 401, error: 'InvalidCredentialsError', message: 'Invalid email or password' },
      },
    });
    renderWithRouter(<AppRoutes />, '/login');

    await submitCredentials('dana@example.com', 'wrong password', 'Log in');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('submits with the Enter key', async () => {
    stubFetchRoutes({
      'GET /api/auth/me': signedOut,
      'POST /api/auth/login': { status: 200, body: dana },
    });
    renderWithRouter(<AppRoutes />, '/login');

    await userEvent.type(await screen.findByLabelText('Email'), 'dana@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'correct horse battery{Enter}');

    expect(await screen.findByText('dana@example.com')).toBeInTheDocument();
  });

  it('checks the email format in the browser before calling the API', async () => {
    const fetchMock = stubFetchRoutes({ 'GET /api/auth/me': signedOut });
    renderWithRouter(<AppRoutes />, '/login');

    await submitCredentials('not-an-email', 'whatever', 'Log in');

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends a signed-in user straight home', async () => {
    stubFetchRoutes({ 'GET /api/auth/me': { status: 200, body: dana } });

    renderWithRouter(<AppRoutes />, '/login');

    expect(await screen.findByText('dana@example.com')).toBeInTheDocument();
  });
});

describe('sign-up page', () => {
  it('creates the account and signs the user in', async () => {
    stubFetchRoutes({
      'GET /api/auth/me': signedOut,
      'POST /api/auth/signup': { status: 201, body: dana },
    });
    renderWithRouter(<AppRoutes />, '/signup');

    await submitCredentials('dana@example.com', 'correct horse battery', 'Create account');

    expect(await screen.findByText('dana@example.com')).toBeInTheDocument();
  });

  it('enforces the 10-character minimum in the browser', async () => {
    const fetchMock = stubFetchRoutes({ 'GET /api/auth/me': signedOut });
    renderWithRouter(<AppRoutes />, '/signup');

    await submitCredentials('dana@example.com', 'too short', 'Create account');

    expect(await screen.findByText('Use at least 10 characters')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows the server message when the email is taken', async () => {
    stubFetchRoutes({
      'GET /api/auth/me': signedOut,
      'POST /api/auth/signup': {
        status: 409,
        body: { statusCode: 409, error: 'EmailTakenError', message: 'An account with this email already exists' },
      },
    });
    renderWithRouter(<AppRoutes />, '/signup');

    await submitCredentials('dana@example.com', 'correct horse battery', 'Create account');

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists');
  });
});
