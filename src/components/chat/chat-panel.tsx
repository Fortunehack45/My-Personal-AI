
'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Message } from '@/lib/data';
import { MessageList } from './message-list';
import { MessageComposer } from './message-composer';
import { generateResponse as generateResponseFlow } from '@/ai/flows/generate-response';
import { summarizeConversationTitle } from '@/ai/flows/summarize-conversation-title';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { updateMessageContent as updateMessageContentAction } from '@/lib/firebase-admin';

type ChatPanelProps = {
  conversationId: string | undefined;
  conversationTitle: string;
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
  const { toast } = useToast();
  
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

  const createNewConversation = async (firstMessage: string) => {
    if (!user) return null;

    // Generate title first
    let title = 'New Conversation';
    try {
        const result = await summarizeConversationTitle({ message: firstMessage });
        if (result && result.title) {
            title = result.title;
        }
    } catch (e) {
        console.error("Failed to generate conversation title:", e);
    }

    const newConversationRef = await addDoc(collection(db, 'users', user.uid, 'conversations'), {
      title: title,
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

  const generateResponse = useCallback(async (prompt: string, convId: string, attachmentDataUri?: string) => {
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
      const { response } = await generateResponseFlow({
        conversationId: convId,
        message: prompt,
        user: userProfile || undefined,
        attachmentDataUri: attachmentDataUri,
      });

      const assistantMessageId = await saveMessage('assistant', response, convId);

      if (userProfile?.voiceModeEnabled && response && assistantMessageId) {
        const { audioDataUri } = await textToSpeech({ text: response, voice: userProfile.voice });
        handlePlayAudio(assistantMessageId, audioDataUri);
      }
    } catch (error) {
        console.error("Error generating response:", error);
        await saveMessage('assistant', "Sorry, I couldn't generate a response. Please try again.", convId);
    } finally {
        setIsLoading(false);
        // Remove the 'thinking' placeholder
        setMessages((prev) => prev.filter((msg) => msg.status !== 'thinking'));
    }
  }, [userProfile]);

  const handleSendMessage = async (content: string, attachmentDataUri?: string) => {
    if (!user) return;
    
    let currentConvId = conversationId;
    
    if (!currentConvId) {
      currentConvId = await createNewConversation(content);
      if (!currentConvId) return;
    }

    await saveMessage('user', content, currentConvId, attachmentDataUri);
    await generateResponse(content, currentConvId, attachmentDataUri);
  };
  
  const handleRegenerate = useCallback(async () => {
      if (!conversationId || !user) return;

      // Find the last user message in the local state
      const userMessages = messages.filter(m => m.role === 'user');
      const lastUserMessage = userMessages[userMessages.length - 1];

      if (lastUserMessage) {
        // Delete all assistant messages that came after the last user message
        const lastUserMessageIndex = messages.findIndex(m => m.id === lastUserMessage.id);
        const messagesToDelete = messages.slice(lastUserMessageIndex + 1).filter(m => m.role === 'assistant');
        
        for (const msg of messagesToDelete) {
            // This is a local removal for immediate UI feedback.
            // A more robust solution would also delete from Firestore.
            setMessages(prev => prev.filter(m => m.id !== msg.id));
        }

        await generateResponse(lastUserMessage.content, conversationId, lastUserMessage.attachmentDataUri);
      }
  }, [conversationId, user, messages, generateResponse]);


  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!conversationId || !user) return;
    try {
      // Use the server action to update the message
      await updateMessageContentAction({
        userId: user.uid,
        conversationId,
        messageId,
        newContent,
      });

      // Optimistically update local state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );

      toast({
        title: 'Message Updated',
        description: 'Your message has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating your message.',
      });
    }
  };


  return (
    <div className="flex flex-1 flex-col h-full">
      <MessageList 
          messages={messages} 
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
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
