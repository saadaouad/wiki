import { WikiEditor } from '@/components/index';
import type { PageProps } from '@/types/index';

export default async function EditArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`;
  const articleDetails = await fetch(endpoint);

  const articleDetailsData = await articleDetails.json();
  const { id, title, content, author } = articleDetailsData.article;
  const authorId = author.id;

  return (
    <WikiEditor
      initialTitle={title}
      initialContent={content}
      articleId={id}
      articleSlug={slug}
      authorId={authorId}
      isEditing={true}
    />
  );
}
