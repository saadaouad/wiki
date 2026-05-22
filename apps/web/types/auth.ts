import type { User } from './user';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setSessionToken: (token: string | null) => void;
  token: string | null;
};
