import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/providers/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type MutationParams<TBody = unknown> = {
  endpoint: string;
  method: MutationMethod;
  body?: TBody;
  successMessage?: string;
  isProtected?: boolean;
};

export const useMutation = <TData = unknown>() => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const mutation = async <TBody = unknown>({
    endpoint,
    method,
    body,
    successMessage,
    isProtected
  }: MutationParams<TBody>) => {
    setLoading(true);
    try {
      const headers: HeadersInit = {
        ...(isProtected && token ? { Authorization: `Bearer ${token}` } : {})
      };
      const payload = body !== undefined ? JSON.stringify(body) : undefined;
      if (payload !== undefined) {
        Object.assign(headers, { 'Content-Type': 'application/json' });
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: payload
      });

      const raw = await res.text();

      let data = {} as TData;
      try {
        data = JSON.parse(raw);
      } catch {
        // Non-JSON error payload (unexpected from our API).
      }

      if (!res.ok) {
        const message = (data as { error: string }).error;
        toast.error(message);
      } else if (successMessage) {
        toast.success(successMessage);
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
