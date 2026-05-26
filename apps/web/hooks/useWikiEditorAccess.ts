import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/providers/authentication';

type UseWikiEditorAccessOptions = {
  isEditing: boolean;
  authorId?: string;
};

export function useWikiEditorAccess({ isEditing, authorId }: UseWikiEditorAccessOptions) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/signin');
      return;
    }
    if (isEditing && user?.id !== authorId) {
      router.replace('/');
    }
  }, [authorId, isAuthenticated, isEditing, router, user?.id]);

  const accessDenied = !isAuthenticated || (isEditing && user?.id !== authorId);

  return { accessDenied };
}
