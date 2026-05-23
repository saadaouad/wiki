import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/providers/authentication';
import { cn } from '@/utils/cn';
import { NavBar } from '@/components/index';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans'
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono'
});

export const metadata: Metadata = {
  title: 'Wiki',
  description: 'Wiki is a platform for reading wikis'
};

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={cn('font-sans', geistSans.variable)}>
      <body className={geistMono.variable}>
        <Toaster position="top-right" richColors />
        <AuthProvider>
          <NavBar />
          <main className="container mx-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
