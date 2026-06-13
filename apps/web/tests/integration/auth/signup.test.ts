import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { setCookie } from 'cookies-next/client';
import { createElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SignUpForm from '@/app/auth/signup/page';
import { authMock, mockFetchResponse, setupAuthTest } from '@/mocks/auth.mock';
import { renderWithProviders } from '@/tests/helpers/renderWithProviders';

async function fillSignUpForm(user: UserEvent) {
  await user.type(screen.getByTestId('firstName-input'), authMock.signUp.firstName);
  await user.type(screen.getByTestId('lastName-input'), authMock.signUp.lastName);
  await user.type(screen.getByTestId('email-input'), authMock.signUp.email);
  await user.type(screen.getByTestId('password-input'), authMock.signUp.password);
}

async function renderSignUp() {
  const result = await renderWithProviders(createElement(SignUpForm));

  await waitFor(() => {
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  return result;
}

describe('Sign up integration', () => {
  beforeEach(setupAuthTest);

  it('renders the sign-up form with all fields and submit button', async () => {
    await renderSignUp();

    expect(screen.getByTestId('firstName-input')).toBeInTheDocument();
    expect(screen.getByTestId('lastName-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('signin-link')).toHaveAttribute('href', '/auth/signin');
  });

  it('shows validation errors when the user submits an empty form', async () => {
    const { user } = await renderSignUp();

    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByTestId('firstName-error')).toHaveTextContent(
      authMock.validation.firstNameRequired
    );
    expect(screen.getByTestId('lastName-error')).toHaveTextContent(
      authMock.validation.lastNameRequired
    );
    expect(screen.getByTestId('email-error')).toHaveTextContent(authMock.validation.emailRequired);
    expect(screen.getByTestId('password-error')).toHaveTextContent(
      authMock.validation.passwordRequired
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid email', async () => {
    const { user } = await renderSignUp();

    await user.type(screen.getByTestId('firstName-input'), authMock.signUp.firstName);
    await user.type(screen.getByTestId('lastName-input'), authMock.signUp.lastName);
    await user.type(screen.getByTestId('email-input'), authMock.signUp.invalidEmail);
    await user.type(screen.getByTestId('password-input'), authMock.signUp.password);
    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByTestId('email-error')).toHaveTextContent(
      authMock.validation.invalidEmail
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows a validation error for a short password', async () => {
    const { user } = await renderSignUp();

    await user.type(screen.getByTestId('firstName-input'), authMock.signUp.firstName);
    await user.type(screen.getByTestId('lastName-input'), authMock.signUp.lastName);
    await user.type(screen.getByTestId('email-input'), authMock.signUp.email);
    await user.type(screen.getByTestId('password-input'), authMock.signUp.shortPassword);
    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByTestId('password-error')).toHaveTextContent(
      authMock.validation.passwordShort
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('signs up successfully and redirects to the home page', async () => {
    mockFetchResponse(authMock.responses.registerSuccess);
    mockFetchResponse(authMock.responses.me);

    const { user } = await renderSignUp();

    await user.type(screen.getByTestId('firstName-input'), authMock.signUp.firstName);
    await user.type(screen.getByTestId('lastName-input'), authMock.signUp.lastName);
    await user.type(screen.getByTestId('email-input'), authMock.signUp.emailInput);
    await user.type(screen.getByTestId('password-input'), authMock.signUp.password);
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    const registerOptions = vi.mocked(fetch).mock.calls[0]?.[1];
    expect(registerOptions?.body).toBeDefined();

    const registerBody = JSON.parse(registerOptions!.body as string);
    expect(registerBody).toEqual({
      firstName: authMock.signUp.firstName,
      lastName: authMock.signUp.lastName,
      email: authMock.signUp.email,
      password: authMock.signUp.password
    });

    expect(toast.success).toHaveBeenCalledWith(authMock.messages.accountCreated);
    expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
      'token',
      authMock.token,
      expect.objectContaining(authMock.cookieOptions)
    );
    expect(useRouter().push).toHaveBeenCalledWith(authMock.homePath);
  });

  it('shows an error toast when registration fails', async () => {
    mockFetchResponse(authMock.responses.registerError, false);

    const { user } = await renderSignUp();

    await fillSignUpForm(user);
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(authMock.messages.emailAlreadyInUse);
    });

    expect(vi.mocked(setCookie)).not.toHaveBeenCalled();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it('disables the submit button while the registration request is in flight', async () => {
    let resolveFetch!: (value: Response) => void;

    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    const { user } = await renderSignUp();

    await fillSignUpForm(user);
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Creating account…');
    });

    resolveFetch({
      ok: false,
      json: async () => authMock.responses.serverError
    } as Response);

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).not.toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Sign up');
    });
  });
});
