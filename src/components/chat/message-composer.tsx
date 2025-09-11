'use client';

import { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Paperclip } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type MessageComposerProps = {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
};

export function MessageComposer({ onSendMessage, isLoading }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = '0px';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [message, textareaRef]);

  return (
    <TooltipProvider>
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
            }}
            className="relative flex w-full items-start gap-3"
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant="outline" className="shrink-0 rounded-full h-12 w-12" disabled={isLoading}>
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Attach file</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
            <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Chatty Sparrow anything..."
                  className="min-h-[52px] max-h-48 w-full rounded-2xl resize-none bg-background border shadow-sm px-4 py-3.5 pr-14 text-base"
                  rows={1}
                  disabled={isLoading}
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="submit"
                            size="icon"
                            variant="default"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                            disabled={!message.trim() || isLoading}
                        >
                            <SendHorizonal className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                </Tooltip>
            </div>
        </form>
    </TooltipProvider>
  );
}