import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useFetch = <TData = unknown>(endpoint: string, token?: string) => {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_URL}${endpoint}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
      .then(async (res) => {
        const json = (await res.json()) as TData;
        if (!res.ok) {
          const message = (json as { error?: string }).error;
          if (message) {
            toast.error(message);
          }
          setData(null);
        } else {
          setData(json);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [endpoint, token]);

  return { data, loading };
};
