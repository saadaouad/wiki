'use client';

import type { ReactNode } from 'react';

import { useAuth } from '@/providers/auth';

export const RequireAuthorization = ({
  authorId,
  children
}: {
  authorId: string;
  children: ReactNode;
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  if (user?.id !== authorId) return null;

  return <>{children}</>;
};
