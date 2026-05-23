'use client';

import Link from 'next/link';
import { Button } from '@/components/index';
import { Plus } from 'lucide-react';

import { useAuth } from '@/providers/authentication';

export const NewArticle = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="mt-10 text-right">
      <Link href="wiki/new" className="cursor-pointer">
        <Button variant="outline" className="cursor-pointer">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </Link>
    </div>
  );
};
