'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { loginSchema, type z } from '@repo/schema-validation';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label
} from '@/components/index';
import { useMutation } from '@/hooks/useMutation';
import { useAuth } from '@/providers/auth';

type SignInValues = z.input<typeof loginSchema>;

type LoginResponse = { token?: string; error?: string };

function SignInForm() {
  const router = useRouter();
  const { setSessionToken } = useAuth();
  const { mutation, loading } = useMutation<LoginResponse>();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    const mutate = await mutation({
      endpoint: '/auth/login',
      method: 'POST',
      body: values
    });

    if (mutate.error) return;
    if (!mutate.token) return;

    setSessionToken(mutate.token);
    router.push('/');
  });

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Don't have an account?{' '}
            <Link className="text-primary underline" href="/auth/signup">
              Sign up
            </Link>
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} noValidate>
          <CardContent className="flex flex-col mt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className="py-5"
                {...register('email')}
              />
              <div className="min-h-4 shrink-0" aria-live="polite">
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className="py-5"
                {...register('password')}
              />
              <div className="min-h-4 shrink-0" aria-live="polite">
                {errors.password && (
                  <p className="text-destructive text-xs">{errors.password.message}</p>
                )}
              </div>
            </div>
            {errors.root && (
              <p className="text-destructive text-sm" role="alert">
                {errors.root.message}
              </p>
            )}
          </CardContent>
          <CardFooter className="mt-6">
            <Button type="submit" disabled={loading} className="w-full py-5 cursor-pointer">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default SignInForm;
