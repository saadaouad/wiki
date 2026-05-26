import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/providers/authentication';

export function useRedirectIfAuthenticated() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/');
    }
  }, [loading, isAuthenticated, router]);

  const accessDenied = loading || isAuthenticated;

  return { accessDenied };
}
