import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email')
  .transform((v) => v.toLowerCase());

const password = z.string().min(1, 'Password is required').min(6, 'Password is short');

export const registerSchema = z.object({
  email,
  password,
  username: z.string().trim().max(50, 'Username must be at most 50 characters'),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters')
});

export const loginSchema = z.object({
  email,
  password
});
