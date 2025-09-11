import type { Message } from '@/lib/data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SparrowIcon } from '@/components/logo';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { Card } from '../ui/card';

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
  if (!messages.length) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
            <div className='p-4 bg-primary/10 rounded-full'>
              <SparrowIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="font-headline text-2xl font-semibold">How can I help you today?</h2>
            <p className="text-muted-foreground max-w-sm">
              Ask me anything from drafting emails to brainstorming ideas. I'm here to assist you.
            </p>
        </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl px-4 pt-4">
      {messages.map((message, index) => (
        <div key={message.id || index} className={cn(
          "flex items-start gap-4 py-6",
          message.role === 'user' ? 'justify-end' : ''
        )}>
          {message.role !== 'user' && (
            <Avatar className={cn(
                "h-8 w-8 border",
                message.role === 'user' ? "bg-background" : "bg-primary text-primary-foreground"
            )}>
              <AvatarFallback className="bg-transparent">
                <SparrowIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          )}

          <div className={cn(
            "flex-1 space-y-2 pt-0.5 max-w-[85%]",
            message.role === 'user' ? 'order-2' : ''
          )}>
            <p className={cn(
              "font-bold font-headline",
              message.role === 'user' ? 'text-right' : ''
            )}>
              {message.role === 'user' ? 'You' : 'Chatty Sparrow'}
            </p>
            <div className={cn(
              "text-foreground leading-relaxed p-4 rounded-2xl",
              message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
            )}>
              {message.content || <span className="animate-pulse">|</span>}
            </div>
          </div>

          {message.role === 'user' && (
            <Avatar className={cn(
                "h-8 w-8 border bg-background",
                'order-1'
            )}>
              <AvatarFallback className="bg-transparent">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}

        </div>
      ))}
    </div>
  );
}
