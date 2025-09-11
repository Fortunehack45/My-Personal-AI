import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function SparrowIcon(props: HTMLAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 2l-4 4-3-1-3 1-4-4-1 6 3 3-4 5-2-2-1 2 4 4 2-2 5-4 3 3 6-1z" />
    </svg>
  );
}

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <SparrowIcon className="h-7 w-7 text-accent" />
      <h1 className="font-headline text-xl font-bold text-foreground">Chatty Sparrow</h1>
    </div>
  );
}