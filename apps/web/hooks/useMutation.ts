import { useState } from 'react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type MutationParams<TBody = unknown> = {
  endpoint: string;
  method: MutationMethod;
  body?: TBody;
};

export const useMutation = <TData = unknown>() => {
  const [loading, setLoading] = useState(false);

  const mutation = async <TBody = unknown>({ endpoint, method, body }: MutationParams<TBody>) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = (await res.json()) as TData;

      if (!res.ok) {
        const message = (data as { error: string }).error;
        toast.error(message);
      }

      return data;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutation, loading };
};
