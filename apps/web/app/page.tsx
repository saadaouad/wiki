import { NewArticle, WikiCard } from '@/components/index';
import type { Article } from '@/types/index';

const Home = async () => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/articles`;

  const articles = await fetch(endpoint, { cache: 'no-cache' });
  const articlesData = await articles.json();

  return (
    <div>
      <NewArticle />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4 md:mx-0">
        {articlesData.articles.map((article: Article) => (
          <WikiCard
            key={article.id}
            title={article.title}
            author={`${article.author.firstName} ${article.author.lastName}`}
            date={article.createdAt}
            summary={article.summary ?? article.content}
            href={`/wiki/${article.slug}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
