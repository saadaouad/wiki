import type { User } from './user';

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  author: User;
}
