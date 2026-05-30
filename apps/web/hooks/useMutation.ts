import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/providers/authentication';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type MutationParams<TBody = unknown> = {
  endpoint: string;
  method: MutationMethod;
  body?: TBody;
  successMessage?: string;
  isProtected?: boolean;
};

export function useMutation<TData = unknown>() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const mutate = async (params: MutationParams): Promise<TData> => {
    const isFormData = params.body instanceof FormData;
    let body: BodyInit | undefined;
    if (params.body != null) {
      body = isFormData ? (params.body as FormData) : JSON.stringify(params.body);
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${params.endpoint}`, {
        method: params.method,
        headers: {
          ...(params.isProtected && token && { Authorization: `Bearer ${token}` }),
          ...(!isFormData && body != null && { 'Content-Type': 'application/json' })
        },
        body
      });

      const data = (await res.json().catch(() => ({}))) as TData;

      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'Request failed');
      } else if (params.successMessage) {
        toast.success(params.successMessage);
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading };
}
