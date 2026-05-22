import { RequireAuthentication, WikiEditor } from '@/components/index';
import type { PageProps } from '@/types/index';

export default async function EditArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const articleDetails = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`);
  const articleDetailsData = await articleDetails.json();
  const { id, title, content } = articleDetailsData.article;

  return (
    <RequireAuthentication>
      <WikiEditor
        initialTitle={title}
        initialContent={content}
        isEditing={true}
        articleId={String(id)}
        articleSlug={slug}
      />
    </RequireAuthentication>
  );
}
