export interface WikiCardProps {
  title: string;
  author: string;
  date: string;
  summary: string;
  href: string;
}

export interface WikiEditorProps {
  initialTitle?: string;
  initialContent?: string;
  isEditing?: boolean;
  articleId?: string;
}

export interface WikiEditorFormPayload {
  title: string;
  content: string;
  files: File[];
}

export interface WikiEditorFormErrors {
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

export interface WikiArticleViewerProps {
  article: ViewerArticle;
  canEdit?: boolean;
  pageviews?: number | null;
}

export interface PageProps {
  params: Promise<{
    id: string;
  }>;
}
