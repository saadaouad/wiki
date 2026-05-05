import NewspaperEditor from '@/components/newspaper-editor';
import type { PageProps } from '@/types/newspaper';

const EditArticlePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const mockData =
    id !== 'new'
      ? {
          title: `Sample Article ${id}`,
          content: `# Sample Article ${id}

This is some sample markdown content for article ${id}.

## Features
- **Bold text**
- *Italic text*
- [Links](https://example.com)

## Code Example
\`\`\`javascript
console.log("Hello from article ${id}");
\`\`\`

This would normally be fetched from your API.`
        }
      : {};

  return (
    <NewspaperEditor
      initialTitle={mockData.title}
      initialContent={mockData.content}
      isEditing={true}
      articleId={id}
    />
  );
};

export default EditArticlePage;
