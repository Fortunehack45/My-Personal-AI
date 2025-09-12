'use client';

import { ChatPanel } from '@/components/chat/chat-panel';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function ChatPage({ params: { conversationId } }: { params: { conversationId?: string[] } }) {
  const currentConversationId = conversationId?.[0];
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
        <div className="flex flex-1 flex-col h-full items-center justify-center">
            <p>Loading chat...</p>
        </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return <ChatPanel conversationId={currentConversationId} />;
}
