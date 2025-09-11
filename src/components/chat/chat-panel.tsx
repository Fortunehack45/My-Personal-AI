'use client';

import { useState, useEffect } from 'react';
import type { Message } from '@/lib/data';
import { MessageList } from './message-list';
import { MessageComposer } from './message-composer';

type ChatPanelProps = {
  messages: Message[];
  conversationId: string | undefined;
};

export function ChatPanel({ messages: initialMessages, conversationId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `${conversationId || 'new'}-${messages.length + 1}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, newMessage]);
    
    // Add an empty assistant message to stream into
    const assistantMessageId = `${conversationId || 'new'}-${messages.length + 2}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Mock streaming AI response
    const response = `This is a streamed response for your message: "${content}". I am demonstrating token-by-token streaming.`;
    const words = response.split(' ');
    
    let currentContent = '';
    words.forEach((word, index) => {
        setTimeout(() => {
            currentContent += (index > 0 ? ' ' : '') + word;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: currentContent }
                  : msg
              )
            );
        }, index * 100);
    });
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
          <MessageComposer onSendMessage={handleSendMessage} />
          <p className="text-center text-xs text-muted-foreground mt-2 px-4">
            Chatty Sparrow may produce inaccurate information about people, places, or facts.
          </p>
        </div>
      </div>
    </div>
  );
}
