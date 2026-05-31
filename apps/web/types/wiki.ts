import type { User } from './user';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  author: User;
  articleView?: number;
}

export type WikiCardProps = {
  title: string;
  author: string;
  date: string;
  summary: string;
  href: string;
};

export type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export type WikiEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  isEditing?: boolean;
  articleId?: string;
  articleSlug?: string;
  authorId?: string;
};

export type WikiEditorFormErrors = {
  title?: string;
  content?: string;
};

export type WikiArticleViewerFormResponse = {
  message?: string;
  error?: string;
};

export type WikiEditorFormResponse = {
  article?: Article;
  error?: string;
};
