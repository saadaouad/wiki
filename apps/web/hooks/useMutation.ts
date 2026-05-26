import { useId } from 'react';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';

import { useAuth } from '@/providers/authentication';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiMutationInput<TBody = unknown> = {
  endpoint: string;
  method: MutationMethod;
  body?: TBody;
  successMessage?: string;
  isProtected?: boolean;
};

async function performApiMutation<T>(
  input: ApiMutationInput<unknown>,
  token: string | null
): Promise<T> {
  const body = input.body !== undefined ? JSON.stringify(input.body) : undefined;

  const res = await fetch(`${API_URL}${input.endpoint}`, {
    method: input.method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(input.isProtected && token ? { Authorization: `Bearer ${token}` } : {})
    },
    body
  });

  const raw = await res.text();
  let data = {} as T;
  if (raw) {
    try {
      data = JSON.parse(raw) as T;
    } catch {
      console.error('Failed to parse JSON response:', raw);
    }
  }

  if (!res.ok) toast.error((data as { error?: string }).error ?? 'Request failed');
  else if (input.successMessage) toast.success(input.successMessage);

  return data;
}

export function useMutation<TData = unknown>() {
  const { token } = useAuth();

  const { trigger, isMutating } = useSWRMutation<TData, unknown, string, ApiMutationInput<unknown>>(
    useId(),
    (_, { arg }) => performApiMutation<TData>(arg, token ?? null)
  );

  const mutate = async <B>(params: ApiMutationInput<B>) => ((await trigger(params)) ?? {}) as TData;

  return { mutate, loading: isMutating };
}
