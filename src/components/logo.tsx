import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

export function SparrowIcon(props: HTMLAttributes<SVGSVGElement>) {
  return (
    <Bot {...props} />
  );
}

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div className="p-1.5 bg-primary/20 rounded-lg">
        <SparrowIcon className="h-6 w-6 text-primary" />
      </div>
      <h1 className="font-headline text-xl font-bold text-foreground">Progress</h1>
    </div>
  );
}
