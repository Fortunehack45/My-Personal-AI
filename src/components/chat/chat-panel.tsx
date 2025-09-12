'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '@/lib/data';
import { MessageList } from './message-list';
import { MessageComposer } from './message-composer';
import { generateResponseBasedOnContext } from '@/ai/flows/generate-response-based-on-context';
import { useAuth } from '@/hooks/use-auth';

type ChatPanelProps = {
  messages: Message[];
  conversationId: string | undefined;
};

export function ChatPanel({ messages: initialMessages, conversationId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const { userProfile } = useAuth();

  const generateResponse = useCallback(async (prompt: string, messagesToUpdate: Message[]) => {
    setIsLoading(true);

    const assistantMessageId = `${conversationId || 'new'}-${messagesToUpdate.length + 1}`;
    const assistantMessagePlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'thinking',
    };
    setMessages((prev) => [...prev, assistantMessagePlaceholder]);

    try {
      const { response } = await generateResponseBasedOnContext({
        conversationId: conversationId || 'new',
        message: prompt,
        user: userProfile || undefined,
      });

      const words = response.split(/(\s+)/);
      let typedContent = '';
      
      const wpm = 20000;
      const averageWordLength = 5;
      const delayPerChar = 60000 / (wpm * averageWordLength);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, status: undefined } : msg
        )
      );

      for (let i = 0; i < words.length; i++) {
        typedContent += words[i];
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: typedContent } : msg
          )
        );
        
        const delay = words[i].length * delayPerChar + Math.random() * (delayPerChar / 2);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: response } : msg
        )
      );

    } catch (error) {
        console.error("Error generating response:", error);
        const errorMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: "Sorry, I couldn't generate a response. Please try again.",
        };
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === assistantMessageId ? errorMessage : msg
            )
        );
    } finally {
        setIsLoading(false);
    }
  }, [conversationId, userProfile]);

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: `${conversationId || 'new'}-${messages.length + 1}`,
      role: 'user',
      content,
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    await generateResponse(content, newMessages);
  };
  
  const handleRegenerate = useCallback(async () => {
    const userMessages = messages.filter((msg) => msg.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (!lastUserMessage) return;

    // Remove the last assistant message
    const newMessages = messages.filter((msg, index) => {
        return !(msg.role === 'assistant' && index === messages.length - 1);
    });
    setMessages(newMessages);

    await generateResponse(lastUserMessage.content, newMessages);
  }, [messages, generateResponse]);


  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

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

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex-1 overflow-y-auto" ref={scrollableContainerRef}>
        <MessageList messages={messages} onRegenerate={handleRegenerate} />
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
