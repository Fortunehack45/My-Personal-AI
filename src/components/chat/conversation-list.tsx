'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Conversation } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { SidebarMenuSkeleton } from '../ui/sidebar';

export function ConversationList() {
  const params = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentConversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId;

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const q = query(
        collection(db, 'users', user.uid, 'conversations'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const convos: Conversation[] = [];
        querySnapshot.forEach((doc) => {
          convos.push({ id: doc.id, ...doc.data() } as Conversation);
        });
        setConversations(convos);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching conversations:", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return null; // Or a loading/placeholder state
  }

  return (
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {isLoading ? (
            <div className="space-y-2">
                <SidebarMenuSkeleton />
                <SidebarMenuSkeleton />
                <SidebarMenuSkeleton />
            </div>
          ) : (
            conversations.map((convo) => (
              <Button
                key={convo.id}
                variant={currentConversationId === convo.id ? 'secondary' : 'ghost'}
                className="w-full justify-start h-9"
                asChild
              >
                <Link href={`/chat/${convo.id}`}>
                  <span className="truncate text-sm font-medium">{convo.title}</span>
                </Link>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
  );
}
