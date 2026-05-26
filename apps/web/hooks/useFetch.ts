import useSWR from 'swr';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetcher<T>([url, token]: readonly [string, string]): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
  });
  const json = (await res.json()) as T;

  if (!res.ok) {
    const msg = (json as { error?: string }).error;
    if (msg) toast.error(msg);
    throw new Error(msg ?? 'Request failed');
  }
  return json;
}

export function useFetch<TData = unknown>(endpoint: string, token?: string) {
  const key = token ? ([`${API_URL}${endpoint}`, token] as const) : null;

  const { data, error, isLoading } = useSWR<TData>(key, fetcher, {
    shouldRetryOnError: false
  });

  return {
    data: error ? null : (data ?? null),
    loading: Boolean(token) && isLoading
  };
}
