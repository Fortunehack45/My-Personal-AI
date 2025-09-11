'use client';

import { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Paperclip } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type MessageComposerProps = {
  onSendMessage: (message: string) => void;
};

export function MessageComposer({ onSendMessage }: MessageComposerProps) {
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
            className="relative flex w-full items-start gap-2"
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="shrink-0">
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
                  className="min-h-[48px] max-h-48 w-full rounded-xl resize-none bg-muted px-4 py-3 pr-14 text-sm border-0"
                  rows={1}
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="submit"
                            size="icon"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                            disabled={!message.trim()}
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
