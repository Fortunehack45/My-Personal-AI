'use client';

import { useState, useEffect, useRef } from 'react';
import type { Message } from '@/lib/data';
import { MessageList } from './message-list';
import { MessageComposer } from './message-composer';
import { generateResponseBasedOnContext } from '@/ai/flows/generate-response-based-on-context';

type ChatPanelProps = {
  messages: Message[];
  conversationId: string | undefined;
};

export function ChatPanel({ messages: initialMessages, conversationId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);
    const newMessage: Message = {
      id: `${conversationId || 'new'}-${messages.length + 1}`,
      role: 'user',
      content,
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    const assistantMessageId = `${conversationId || 'new'}-${newMessages.length + 1}`;
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
        message: content,
      });

      const words = response.split(/(\s+)/);
      let typedContent = '';
      
      const wpm = 5000;
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
  };

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
        <div ref={bottomRef} />
      </div>
      <div className="border-t bg-background/50">
        <div className="mx-auto max-w-3xl p-4 space-y-4">
          <MessageComposer onSendMessage={handleSendMessage} isLoading={isLoading} />
          <p className="text-center text-xs text-muted-foreground px-4">
            Chatty Sparrow may produce inaccurate information about people, places, or facts.
          </p>
        </div>
      </div>
    </div>
  );
}
