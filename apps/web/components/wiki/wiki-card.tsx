import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/index';
import { formatDate } from '@/utils/formatDate';
import { textPreview } from '@/utils/textPreview';
import type { WikiCardProps } from '@/types/index';

export const WikiCard = ({ title, author, date, summary, href }: WikiCardProps) => {

  return (
    <Card>
      <CardHeader className="pb-2 pt-1">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>By {author}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(date)}</span>
          </div>
        </div>
        <CardTitle className="text-lg mt-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-0 h-24">
        <CardDescription>{textPreview(summary)}</CardDescription>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={href} className="text-blue-600 hover:underline text-sm font-medium w-fit">
          Read article &rarr;
        </Link>
      </CardFooter>
    </Card>
  );
};
