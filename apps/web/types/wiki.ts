import type { Article } from './article';

export interface WikiCardProps {
  title: string;
  author: string;
  date: string;
  summary: string;
  href: string;
}

export type WikiEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  isEditing?: boolean;
  articleId?: string;
};

export type WikiEditorFormPayload = {
  title: string;
  content: string;
  files: File[];
};

export type WikiEditorFormErrors = {
  title?: string;
  content?: string;
};

export type WikiArticleViewerProps = {
  article: Article;
  canEdit?: boolean;
  pageviews?: number | null;
};

export type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};
