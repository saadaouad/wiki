import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { cn } from '@/utils/cn';
import { NavBar } from '@/components/nav-bar';
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
  title: 'Newspaper',
  description: 'Newspaper is a platform for reading news'
};

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={cn('font-sans', geistSans.variable)}>
      <body className={geistMono.variable}>
        <NavBar />
        <main className="container mx-auto">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
