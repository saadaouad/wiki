export interface NewsPaperCardProps {
  title: string;
  author: string;
  date: string;
  summary: string;
  href: string;
}

export interface NewspaperEditorProps {
  initialTitle?: string;
  initialContent?: string;
  isEditing?: boolean;
  articleId?: string;
}

export interface NewspaperEditorFormPayload {
  title: string;
  content: string;
  files: File[];
}

export interface NewspaperEditorFormErrors {
  title?: string;
  content?: string;
}

export interface ViewerArticle {
  title: string;
  author: string | null;
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
}

export interface NewspaperArticleViewerProps {
  article: ViewerArticle;
  canEdit?: boolean;
  pageviews?: number | null;
}

export interface PageProps {
  params: Promise<{
    id: string;
  }>;
}
