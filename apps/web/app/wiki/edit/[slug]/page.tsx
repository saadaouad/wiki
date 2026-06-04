import { WikiEditor } from '@/components/index';
import type { PageProps } from '@/types/index';

const EditArticlePage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`;
  const articleDetails = await fetch(endpoint);
  const articleDetailsData = await articleDetails.json();
  const { id, title, content, author } = articleDetailsData.article;

  return (
    <WikiEditor
      articleId={id}
      articleSlug={slug}
      initialTitle={title}
      initialContent={content}
      authorId={author.id}
      isEditing={true}
    />
  );
}

export default EditArticlePage;
