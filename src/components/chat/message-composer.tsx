'use client';

import { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Paperclip, Globe, Zap, Library, GraduationCap, Image as ImageIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

type MessageComposerProps = {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
};

export function MessageComposer({ onSendMessage, isLoading }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isFeatureLoading, setIsFeatureLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleFeatureClick = (featureName: string) => {
    setIsFeatureLoading(true);
    toast({
      title: 'Working on it...',
      description: `The "${featureName}" feature is not yet implemented. This is a placeholder.`,
    });

    // Simulate an async operation
    setTimeout(() => {
      setIsFeatureLoading(false);
    }, 2000);
  };

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

  const anyLoading = isLoading || isFeatureLoading;

  return (
    <TooltipProvider>
        <div className="flex flex-col w-full gap-4">
            <div className="flex w-full items-start gap-3">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="icon" variant="outline" className="shrink-0 rounded-full h-12 w-12" disabled={anyLoading}>
                            <Paperclip className="h-5 w-5" />
                            <span className="sr-only">Attach file</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="relative flex-1"
                >
                    <Textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Chatty Sparrow anything..."
                      className="min-h-[52px] max-h-48 w-full rounded-2xl resize-none bg-background border shadow-sm px-4 py-3.5 pr-14 text-base"
                      rows={1}
                      disabled={anyLoading}
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="submit"
                                size="icon"
                                variant="default"
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                                disabled={!message.trim() || anyLoading}
                            >
                                <SendHorizonal className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                    </Tooltip>
                </form>
            </div>
            <div className="flex items-center justify-center gap-2">
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="sm" variant="outline" className="gap-2" disabled={anyLoading} onClick={() => handleFeatureClick('Internet Search')}>
                            <Globe />
                            <span className="hidden sm:inline">Search</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Internet Search</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="sm" variant="outline" className="gap-2" disabled={anyLoading} onClick={() => handleFeatureClick('Think Longer')}>
                            <Zap />
                            <span className="hidden sm:inline">Think Longer</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Iterative Reasoning</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="sm" variant="outline" className="gap-2" disabled={anyLoading} onClick={() => handleFeatureClick('Deep Research')}>
                            <Library />
                            <span className="hidden sm:inline">Research</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Deep Research</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="sm" variant="outline" className="gap-2" disabled={anyLoading} onClick={() => handleFeatureClick('Study & Learn')}>
                            <GraduationCap />
                            <span className="hidden sm:inline">Study</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Study &amp; Learn</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="sm" variant="outline" className="gap-2" disabled={anyLoading} onClick={() => handleFeatureClick('Image Creation')}>
                            <ImageIcon />
                            <span className="hidden sm:inline">Image</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Image Creation</TooltipContent>
                </Tooltip>
            </div>
        </div>
    </TooltipProvider>
  );
}
