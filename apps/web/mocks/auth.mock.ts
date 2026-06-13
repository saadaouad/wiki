import { vi } from 'vitest';

export const authMock = {
  token: 'jwt-token',
  homePath: '/',
  cookieOptions: { path: '/', sameSite: 'lax' as const },
  signIn: {
    email: 'user@example.com',
    emailInput: 'User@Example.com',
    password: 'password123',
    wrongPassword: 'wrongpassword',
    invalidEmail: 'not-an-email'
  },
  signUp: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    emailInput: 'Jane@Example.com',
    password: 'password123',
    shortPassword: 'short',
    invalidEmail: 'not-an-email'
  },
  validation: {
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    invalidEmail: 'Invalid email',
    passwordShort: 'Password is short'
  },
  responses: {
    loginSuccess: { token: 'jwt-token', message: 'Login successful' },
    loginTokenOnly: { token: 'jwt-token' },
    loginError: { error: 'Invalid credentials' },
    registerSuccess: { token: 'jwt-token', message: 'Registration successful' },
    registerError: { error: 'Email already in use' },
    me: { user: { id: '1', email: 'jane@example.com' } },
    serverError: { error: 'Server error' }
  },
  messages: {
    accountCreated: 'Account has been created',
    invalidCredentials: 'Invalid credentials',
    emailAlreadyInUse: 'Email already in use'
  }
} as const;

export function mockFetchResponse(body: unknown, ok = true) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok,
    json: async () => body
  } as Response);
}

export function setupAuthTest() {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
}
