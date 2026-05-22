import { RequireAuthentication, WikiEditor } from '@/components/index';

const NewArticlePage = () => {
  return (
    <RequireAuthentication>
      <WikiEditor isEditing={false} />
    </RequireAuthentication>
  );
};

export default NewArticlePage;
