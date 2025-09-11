'use client';

import { useState, useEffect } from 'react';
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
    };
    setMessages((prev) => [...prev, assistantMessagePlaceholder]);

    try {
      const { response } = await generateResponseBasedOnContext({
        conversationId: conversationId || 'new',
        message: content,
      });

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: response,
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? assistantMessage : msg
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

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex-1 overflow-auto">
        <MessageList messages={messages} />
      </div>
      <div className="border-t bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl p-4">
          <MessageComposer onSendMessage={handleSendMessage} isLoading={isLoading} />
          <p className="text-center text-xs text-muted-foreground mt-2 px-4">
            Chatty Sparrow may produce inaccurate information about people, places, or facts.
          </p>
        </div>
      </div>
    </div>
  );
}
