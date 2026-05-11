import { z } from 'zod';

const email = z
  .string()
  .email('Invalid email')
  .transform((value) => value.toLowerCase());

const password = z.string().min(6, 'Password is short');

export const registerSchema = z.object({
  email,
  password,
  username: z
    .string()
    .min(1, 'Username is short')
    .max(50, 'Username must be at most 50 characters'),
  firstName: z.string().max(50, 'First name must be at most 50 characters').optional(),
  lastName: z.string().max(50, 'Last name must be at most 50 characters').optional()
});

export const loginSchema = z.object({
  email,
  password
});
