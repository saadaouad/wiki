import { WikiArticleViewer } from '@/components/index';
import type { PageProps } from '@/types/wiki';

const ViewArticlePage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const articleDetails = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`);
  const articleDetailsData = await articleDetails.json();

  const canEdit = true;

  return <WikiArticleViewer article={articleDetailsData.article} canEdit={canEdit} />;
};

export default ViewArticlePage;
