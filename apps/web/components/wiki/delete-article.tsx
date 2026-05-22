'use client';

import { useRouter } from 'next/navigation';
import { Trash } from 'lucide-react';

import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/index';
import { useMutation } from '@/hooks/useMutation';
import type { WikiArticleViewerFormResponse } from '@/types/index';

export const DeleteArticle = ({ articleId }: { articleId: string }) => {
  const { mutation, loading } = useMutation<WikiArticleViewerFormResponse>();
  const router = useRouter();

  const handleDeleteArticle = async () => {
    const mutate = await mutation({
      endpoint: `/articles/${articleId}`,
      method: 'DELETE',
      successMessage: 'Article has been deleted successfully!',
      isProtected: true
    });

    if (mutate.error) return;

    router.push('/');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="ml-2 cursor-pointer">
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the article from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDeleteArticle} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
