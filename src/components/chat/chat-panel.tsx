'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Message } from '@/lib/data';
import { MessageList } from './message-list';
import { MessageComposer } from './message-composer';
import { generateResponseBasedOnContext } from '@/ai/flows/generate-response-based-on-context';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

type ChatPanelProps = {
  conversationId: string | undefined;
};

type ActiveAudio = {
  messageId: string;
  audioDataUri: string;
};

export function ChatPanel({ conversationId: currentConversationId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAudio, setActiveAudio] = useState<ActiveAudio | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(currentConversationId);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    setConversationId(currentConversationId);
  }, [currentConversationId]);

  useEffect(() => {
    if (user && conversationId) {
      const messagesQuery = query(
        collection(db, 'users', user.uid, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const msgs: Message[] = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
      });

      return () => unsubscribe();
    } else {
        setMessages([]);
    }
  }, [conversationId, user]);


  const handlePlayAudio = (messageId: string, audioDataUri: string) => {
    setActiveAudio({ messageId, audioDataUri });
  };
  
  const handleAudioEnded = () => {
    setActiveAudio(null);
  };

  const createNewConversation = async (initialMessageContent: string) => {
    if (!user) return null;

    const newConversationRef = await addDoc(collection(db, 'users', user.uid, 'conversations'), {
      title: initialMessageContent.substring(0, 50),
      createdAt: serverTimestamp(),
      userId: user.uid,
    });
    setConversationId(newConversationRef.id);
    router.replace(`/chat/${newConversationRef.id}`);
    return newConversationRef.id;
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string, convId: string) => {
      if (!user) return null;
      const messageRef = await addDoc(collection(db, 'users', user.uid, 'conversations', convId, 'messages'), {
        role,
        content,
        createdAt: serverTimestamp(),
      });
      return messageRef.id;
  };

  const generateResponse = useCallback(async (prompt: string, convId: string) => {
    setIsLoading(true);
    
    // Use a placeholder for immediate UI feedback
    const assistantMessagePlaceholder: Message = {
      id: `thinking-${Date.now()}`,
      role: 'assistant',
      content: '',
      status: 'thinking',
      createdAt: new Date() as any, // Temporary timestamp
    };
    setMessages((prev) => [...prev, assistantMessagePlaceholder]);

    try {
      const { response } = await generateResponseBasedOnContext({
        conversationId: convId,
        message: prompt,
        user: userProfile || undefined,
      });

      // Save the actual response to Firestore
      const assistantMessageId = await saveMessage('assistant', response, convId);

      // Auto-play audio if voice mode is enabled
      if (userProfile?.voiceModeEnabled && response && assistantMessageId) {
        const { audioDataUri } = await textToSpeech({ text: response, voice: userProfile.voice });
        handlePlayAudio(assistantMessageId, audioDataUri);
      }

    } catch (error) {
        console.error("Error generating response:", error);
        saveMessage('assistant', "Sorry, I couldn't generate a response. Please try again.", convId);
    } finally {
        setIsLoading(false);
    }
  }, [user, userProfile]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
    let currentConvId = conversationId;
    
    if (!currentConvId) {
      currentConvId = await createNewConversation(content);
      if (!currentConvId) return;
    }

    await saveMessage('user', content, currentConvId);
    await generateResponse(content, currentConvId);
  };
  
  const handleRegenerate = useCallback(async () => {
    if (!conversationId || !user) return;

    const messagesQuery = query(
      collection(db, 'users', user.uid, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(messagesQuery);
    
    let lastUserMessageContent: string | null = null;
    const batch = writeBatch(db);
    let foundAssistantMessage = false;

    // Find the last user message and delete the assistant message(s) after it
    for (const doc of querySnapshot.docs) {
      const message = doc.data();
      if (message.role === 'assistant') {
        batch.delete(doc.ref);
        foundAssistantMessage = true;
      }
      if (message.role === 'user') {
        lastUserMessageContent = message.content;
        break;
      }
    }
    
    if (lastUserMessageContent) {
      await batch.commit();
      await generateResponse(lastUserMessageContent, conversationId);
    } else if (!foundAssistantMessage && messages.length > 0) {
      // Handle case where only a user message exists
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        await generateResponse(lastMessage.content, conversationId);
      }
    }

  }, [conversationId, user, messages, generateResponse]);


  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (container) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        atBottomRef.current = isAtBottom;
      };
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (atBottomRef.current && scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    // This effect is to handle the streaming-like display of assistant messages
    // Since we are now saving the full message to Firestore at once,
    // a different approach would be needed for word-by-word streaming.
    // For simplicity, this is removed. The message will appear once it's saved.
  }, [messages]);


  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex-1 overflow-y-auto" ref={scrollableContainerRef}>
        <MessageList 
            messages={messages} 
            onRegenerate={handleRegenerate}
            activeAudio={activeAudio}
            onPlayAudio={handlePlayAudio}
            onAudioEnded={handleAudioEnded}
            isNewChat={!conversationId}
        />
      </div>
      <div className="border-t bg-background/50">
        <div className="mx-auto max-w-3xl p-4 space-y-4">
          <MessageComposer onSendMessage={handleSendMessage} isLoading={isLoading} />
          <p className="text-center text-xs text-muted-foreground px-4">
            Progress may produce inaccurate information about people, places, or facts.
          </p>
        </div>
      </div>
    </div>
  );
}
