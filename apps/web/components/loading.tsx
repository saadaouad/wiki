import { Spinner } from '@/components/ui/spinner';

const Loading = () => {
  return (
    <div className="flex items-center gap-2 justify-center h-screen">
      <Spinner data-icon="inline-start" />
      Loading...
    </div>
  );
};
export default Loading;
