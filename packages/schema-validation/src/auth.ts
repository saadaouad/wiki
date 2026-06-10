import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email')
  .transform((v) => v.toLowerCase());

// To do: align with NIST SP 800-63B: favor length over complexity rules
const password = z.string().min(1, 'Password is required').min(6, 'Password is short');

export const registerSchema = z.object({
  email,
  password,
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
