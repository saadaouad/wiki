'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { Button } from '../ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from './navigation-menu';
import { useAuth } from '@/providers/auth';

export const NavBar = () => {
  const router = useRouter();
  const { user, isAuthenticated, setSessionToken } = useAuth();

  const handleSignOut = () => {
    router.push('/');
    setSessionToken(null);
  };

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
            Wiki
          </Link>
        </div>
        <NavigationMenu>
          {isAuthenticated ? (
            <NavigationMenuList className="flex items-center gap-3">
              <span className="text-sm font-medium text-black">
                {user?.firstName} {user?.lastName}
              </span>
              <NavigationMenuItem>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut /> Sign out
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          ) : (
            <NavigationMenuList className="flex items-center gap-2">
              <NavigationMenuItem>
                <Button asChild variant="outline">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          )}
        </NavigationMenu>
      </div>
    </nav>
  );
};
