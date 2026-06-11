import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/providers/authentication';
import type { WikiEditorAccessOptions } from '@/types/index';

export function useWikiEditorAccess({ isEditing, authorId }: WikiEditorAccessOptions) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return router.replace('/auth/signin');

    if (isEditing && user?.id !== authorId) return router.replace('/');
  }, [authorId, isAuthenticated, isEditing, router, user?.id]);

  const accessDenied = !isAuthenticated || (isEditing && user?.id !== authorId);

  return { accessDenied };
}
