import { WikiArticleViewer } from '@/components/index';
import type { PageProps } from '@/types/index';

const ViewArticlePage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`;
  const articleDetails = await fetch(endpoint);

  const { article } = await articleDetails.json();

  return <WikiArticleViewer article={article} />;
};

export default ViewArticlePage;
