import { WikiArticleViewer } from '@/components/index';
import type { PageProps } from '@/types/index';

const ViewArticlePage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const articleDetails = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`);
  const { article } = await articleDetails.json();

  return <WikiArticleViewer article={article} authorId={article.author.id} />;
};

export default ViewArticlePage;
