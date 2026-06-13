import { createElement } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { setCookie } from 'cookies-next/client';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import SignInForm from '@/app/auth/signin/page';
import { authMock, mockFetchResponse, setupAuthTest } from '@/mocks/auth.mock';
import { renderWithProviders } from '@/tests/helpers/renderWithProviders';

async function renderSignIn() {
  const result = await renderWithProviders(createElement(SignInForm));

  await waitFor(() => {
    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
  });

  return result;
}

describe('Sign in integration', () => {
  beforeEach(setupAuthTest);

  it('renders the sign-in form with email, password, and submit button', async () => {
    await renderSignIn();

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('signup-link')).toHaveAttribute('href', '/auth/signup');
  });

  it('shows validation errors when the user submits an empty form', async () => {
    const { user } = await renderSignIn();

    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByTestId('email-error')).toHaveTextContent(
      authMock.validation.emailRequired
    );
    expect(screen.getByTestId('password-error')).toHaveTextContent(
      authMock.validation.passwordRequired
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid email', async () => {
    const { user } = await renderSignIn();

    await user.type(screen.getByTestId('email-input'), authMock.signIn.invalidEmail);
    await user.type(screen.getByTestId('password-input'), authMock.signIn.password);
    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByTestId('email-error')).toHaveTextContent(
      authMock.validation.invalidEmail
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('signs in successfully and redirects to the home page', async () => {
    mockFetchResponse(authMock.responses.loginSuccess);

    const { user } = await renderSignIn();

    await user.type(screen.getByTestId('email-input'), authMock.signIn.emailInput);
    await user.type(screen.getByTestId('password-input'), authMock.signIn.password);
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authMock.signIn.email,
          password: authMock.signIn.password
        })
      });
    });

    expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
      'token',
      authMock.token,
      expect.objectContaining(authMock.cookieOptions)
    );
    expect(useRouter().push).toHaveBeenCalledWith(authMock.homePath);
  });

  it('shows an error toast when credentials are invalid', async () => {
    mockFetchResponse(authMock.responses.loginError, false);

    const { user } = await renderSignIn();

    await user.type(screen.getByTestId('email-input'), authMock.signIn.email);
    await user.type(screen.getByTestId('password-input'), authMock.signIn.wrongPassword);
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(authMock.messages.invalidCredentials);
    });

    expect(vi.mocked(setCookie)).not.toHaveBeenCalled();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it('disables the submit button while the login request is in flight', async () => {
    let resolveFetch!: (value: Response) => void;

    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    const { user } = await renderSignIn();

    await user.type(screen.getByTestId('email-input'), authMock.signIn.email);
    await user.type(screen.getByTestId('password-input'), authMock.signIn.password);
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Signing in…');
    });

    resolveFetch({
      ok: true,
      json: async () => authMock.responses.loginTokenOnly
    } as Response);

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).not.toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Sign in');
    });
  });
});
