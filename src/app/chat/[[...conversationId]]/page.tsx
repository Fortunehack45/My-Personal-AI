'use client';

import { useEffect, useState } from 'react';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ChatPage() {
  const params = useParams();
  const currentConversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversationTitle, setConversationTitle] = useState('New Conversation');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    async function fetchTitle() {
      if (user && currentConversationId) {
        const convoDoc = await getDoc(doc(db, 'users', user.uid, 'conversations', currentConversationId));
        if (convoDoc.exists()) {
          setConversationTitle(convoDoc.data().title);
        }
      } else {
        setConversationTitle('New Conversation');
      }
    }
    fetchTitle();
  }, [user, currentConversationId]);

  if (loading) {
    return (
        <div className="flex flex-1 flex-col h-full items-center justify-center">
            <p>Loading chat...</p>
        </div>
    );
  }

  if (!user) {
    // Render nothing while redirecting
    return null;
  }

  return <ChatPanel conversationId={currentConversationId} conversationTitle={conversationTitle} />;
}
