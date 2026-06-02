import { Home, Search, X } from 'lucide-react';
import Link from 'next/link';

import { Button, Card, CardContent } from '@/components/index';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8">
          <div className="relative mb-6">
            <Search className="h-16 w-16 mx-auto text-muted-foreground" />
            <X className="h-8 w-8 absolute -top-1 -right-1 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The wiki page you're looking for doesn't exist. It might have been moved, deleted, or
            you entered the wrong URL.
          </p>
          <Link href="/">
            <Button className="w-full cursor-pointer" size="lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Wiki Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
