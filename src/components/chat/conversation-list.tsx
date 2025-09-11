'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { conversations } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export function ConversationList() {
  const params = useParams();
  const currentConversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId;

  return (
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {conversations.map((convo) => (
            <Button
              key={convo.id}
              variant={currentConversationId === convo.id ? 'secondary' : 'ghost'}
              className="w-full justify-start h-9"
              asChild
            >
              <Link href={`/chat/${convo.id}`}>
                <span className="truncate text-sm">{convo.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
  );
}
