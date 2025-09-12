'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Message } from '@/lib/data';
import { MessageList } from './message-list';
import { MessageComposer, AiMode } from './message-composer';
import { generateResponse } from '@/ai/flows/generate-response';
import { generateImage } from '@/ai/flows/generate-image';
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
      title: initialMessageContent.substring(0, 50) || 'New Conversation',
      createdAt: serverTimestamp(),
      userId: user.uid,
    });
    setConversationId(newConversationRef.id);
    router.replace(`/chat/${newConversationRef.id}`);
    return newConversationRef.id;
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string, convId: string, attachmentDataUri?: string) => {
      if (!user) return null;
      const messageData: { role: 'user' | 'assistant', content: string, createdAt: any, attachmentDataUri?: string } = {
        role,
        content,
        createdAt: serverTimestamp(),
      };
      if (attachmentDataUri) {
        messageData.attachmentDataUri = attachmentDataUri;
      }

      const messageRef = await addDoc(collection(db, 'users', user.uid, 'conversations', convId, 'messages'), messageData);
      return messageRef.id;
  };

  const generateResponse = useCallback(async (prompt: string, convId: string, mode: AiMode, attachmentDataUri?: string) => {
    setIsLoading(true);
    
    const assistantMessagePlaceholder: Message = {
      id: `thinking-${Date.now()}`,
      role: 'assistant',
      content: '',
      status: 'thinking',
      createdAt: new Date() as any, 
    };
    setMessages((prev) => [...prev, assistantMessagePlaceholder]);

    try {
      if (mode === 'image') {
          const {imageDataUri} = await generateImage({prompt});
          saveMessage('assistant', `Image generation complete for: "${prompt}"`, convId, imageDataUri);

      } else {
        const { response } = await generateResponse({
          conversationId: convId,
          message: prompt,
          user: userProfile || undefined,
          attachmentDataUri: attachmentDataUri,
          mode: mode,
        });
  
        const assistantMessageId = await saveMessage('assistant', response, convId);
  
        if (userProfile?.voiceModeEnabled && response && assistantMessageId) {
          const { audioDataUri } = await textToSpeech({ text: response, voice: userProfile.voice });
          handlePlayAudio(assistantMessageId, audioDataUri);
        }
      }

    } catch (error) {
        console.error("Error generating response:", error);
        saveMessage('assistant', "Sorry, I couldn't generate a response. Please try again.", convId);
    } finally {
        setIsLoading(false);
        // Remove the 'thinking' placeholder
        setMessages((prev) => prev.filter((msg) => msg.status !== 'thinking'));
    }
  }, [userProfile]);

  const handleSendMessage = async (content: string, mode: AiMode, attachmentDataUri?: string) => {
    if (!user) return;
    
    let currentConvId = conversationId;
    
    if (!currentConvId) {
      currentConvId = await createNewConversation(content);
      if (!currentConvId) return;
    }

    await saveMessage('user', content, currentConvId, attachmentDataUri);
    await generateResponse(content, currentConvId, mode, attachmentDataUri);
  };
  
  const handleRegenerate = useCallback(async () => {
    if (!conversationId || !user) return;

    // For simplicity, we'll regenerate in 'standard' mode.
    // A more advanced implementation could store the mode per-message.
    const regenerationMode: AiMode = 'standard';

    const messagesQuery = query(
      collection(db, 'users', user.uid, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(messagesQuery);
    
    let lastUserMessageContent: string | null = null;
    let lastUserMessageAttachment: string | undefined = undefined;
    const batch = writeBatch(db);
    let foundAssistantMessage = false;

    // Delete the last assistant message(s) from the database
    for (const doc of querySnapshot.docs) {
      const message = doc.data();
      if (message.role === 'assistant') {
        batch.delete(doc.ref);
        foundAssistantMessage = true;
      }
      if (message.role === 'user') {
        lastUserMessageContent = message.content;
        lastUserMessageAttachment = message.attachmentDataUri;
        break; // Stop after finding the last user message
      }
    }
    
    if (lastUserMessageContent !== null) {
      await batch.commit(); // Apply the deletions
      // Now regenerate response for the last user message
      await generateResponse(lastUserMessageContent, conversationId, regenerationMode, lastUserMessageAttachment);
    } else if (!foundAssistantMessage && messages.length > 0) {
      // This handles the case where there's no assistant message in the DB, but there is a user message in the local state.
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        await generateResponse(lastMessage.content, conversationId, regenerationMode, lastMessage.attachmentDataUri);
      }
    }

  }, [conversationId, user, messages, generateResponse]);

  return (
    <div className="flex flex-1 flex-col h-full">
      <MessageList 
          messages={messages} 
          onRegenerate={handleRegenerate}
          activeAudio={activeAudio}
          onPlayAudio={handlePlayAudio}
          onAudioEnded={handleAudioEnded}
          isNewChat={!conversationId}
      />
      <div className="border-t bg-background/50 backdrop-blur-sm">
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
