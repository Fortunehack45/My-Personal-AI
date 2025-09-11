import type { Message } from '@/lib/data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SparrowIcon } from '@/components/logo';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
  if (!messages.length) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
            <SparrowIcon className="h-16 w-16 text-muted-foreground/30" />
            <h2 className="font-headline text-2xl font-semibold">How can I help you today?</h2>
            <p className="text-muted-foreground">Start a new conversation to begin.</p>
        </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl px-4 pt-4">
      {messages.map((message, index) => (
        <div key={message.id || index} className="flex items-start gap-4 py-6">
          <Avatar className={cn(
              "h-8 w-8 border",
              message.role === 'user' ? "bg-background" : "bg-primary text-primary-foreground"
          )}>
            <AvatarFallback className="bg-transparent">
              {message.role === 'user' ? <User className="h-4 w-4" /> : <SparrowIcon className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2 pt-0.5">
            <p className="font-bold font-headline">
              {message.role === 'user' ? 'You' : 'Chatty Sparrow'}
            </p>
            <div className="text-foreground leading-relaxed">
              {message.content || <span className="animate-pulse">|</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
