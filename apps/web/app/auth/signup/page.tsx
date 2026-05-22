'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { registerSchema, type z } from '@repo/schema-validation';

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

type SignUpValues = z.input<typeof registerSchema>;

type RegisterResponse = { token?: string; error?: string };

function SignUpForm() {
  const router = useRouter();
  const { setSessionToken } = useAuth();
  const { mutation, loading } = useMutation<RegisterResponse>();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignUpValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', firstName: '', lastName: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    const mutate = await mutation({
      endpoint: '/auth/register',
      method: 'POST',
      body: values,
      successMessage: 'Account has been created'
    });

    if (mutate.error) return;
    if (!mutate.token) return;

    setSessionToken(mutate.token);
    router.push('/');
  });

  return (
    <div className="flex mt-10 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Create a new account</CardTitle>
          <CardDescription>
            Already have an account?{' '}
            <Link className="text-primary underline" href="/auth/signin">
              Sign in
            </Link>
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} noValidate>
          <CardContent className="flex flex-col mt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                className="py-5"
                {...register('firstName')}
              />
              <div className="min-h-4 shrink-0" aria-live="polite">
                {errors.firstName && (
                  <p className="text-destructive text-xs">{errors.firstName.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                className="py-5"
                {...register('lastName')}
              />
              <div className="min-h-4 shrink-0" aria-live="polite">
                {errors.lastName && (
                  <p className="text-destructive text-xs">{errors.lastName.message}</p>
                )}
              </div>
            </div>
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
                autoComplete="new-password"
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
              {loading ? 'Creating account…' : 'Sign up'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default SignUpForm;
