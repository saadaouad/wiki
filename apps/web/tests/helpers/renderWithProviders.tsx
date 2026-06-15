import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { expect } from 'vitest';

import { AuthProvider } from '@/providers/authentication';

export async function renderWithProviders(ui: ReactElement) {
  const user = userEvent.setup();

  render(<AuthProvider>{ui}</AuthProvider>);

  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  return { user };
}
