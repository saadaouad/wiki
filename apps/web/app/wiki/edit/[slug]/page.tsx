import { WikiEditor } from '@/components/index';
import type { PageProps } from '@/types/wiki';

const EditArticlePage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const articleDetails = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`);
  const articleDetailsData = await articleDetails.json();
  const { id, title, content } = articleDetailsData.article;

  return (
    <WikiEditor
      initialTitle={slug !== 'new' ? title : ''}
      initialContent={slug !== 'new' ? content : ''}
      isEditing={true}
      articleId={id}
    />
  );
};

export default EditArticlePage;
