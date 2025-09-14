'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export function HeaderTitle() {
  const params = useParams();
  const { user } = useAuth();
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId;
  const [title, setTitle] = useState('New Conversation');

  useEffect(() => {
    if (user && conversationId) {
      const convoRef = doc(db, 'users', user.uid, 'conversations', conversationId);
      const unsubscribe = onSnapshot(convoRef, (doc) => {
        if (doc.exists()) {
          setTitle(doc.data().title);
        }
      });
      return () => unsubscribe();
    } else {
      setTitle('New Conversation');
    }
  }, [user, conversationId]);

  return (
    <h1 className="font-headline font-semibold text-xl lg:text-2xl truncate">
      {title}
    </h1>
  );
}
