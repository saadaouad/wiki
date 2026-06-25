'use client';

import { useEffect } from 'react';

const ErrorComponent = ({
  error,
  unstable_retry
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) => {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry, Bugsnag, etc.
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button type="button" onClick={() => unstable_retry()}>
        Try again
      </button>
    </div>
  );
};

export default ErrorComponent;
