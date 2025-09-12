'use client';

import { motion } from 'framer-motion';
import type { Message } from '@/lib/data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SparrowIcon, Logo } from '@/components/logo';
import { Markdown } from './markdown';
import { cn } from '@/lib/utils';
import { User, ThumbsUp, ThumbsDown, RefreshCcw, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useRef } from 'react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { submitFeedback } from '@/ai/flows/submit-feedback';
import { useToast } from '@/hooks/use-toast';

type MessageListProps = {
  messages: Message[];
  onRegenerate: () => Promise<void>;
};

type AudioState = 'idle' | 'loading' | 'playing' | 'paused';
type FeedbackState = 'idle' | 'loading';

const ThinkingIndicator = () => (
    <div className="flex items-center gap-2">
        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:-0.3s]" />
        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:-0.15s]" />
        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse" />
    </div>
);

export function MessageList({ messages, onRegenerate }: MessageListProps) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [feedbackState, setFeedbackState] = useState<Record<'like' | 'dislike', FeedbackState>>({ like: 'idle', dislike: 'idle' });

  const handlePlayAudio = async (text: string) => {
    if (audioRef.current && audioState === 'playing') {
      audioRef.current.pause();
      setAudioState('paused');
      return;
    }

    if (audioRef.current && audioState === 'paused') {
      audioRef.current.play();
      setAudioState('playing');
      return;
    }

    setAudioState('loading');
    try {
      const { audioDataUri } = await textToSpeech({ text });
      const audio = new Audio(audioDataUri);
      audioRef.current = audio;

      audio.onplay = () => setAudioState('playing');
      audio.onpause = () => setAudioState('paused');
      audio.onended = () => {
        setAudioState('idle');
        audioRef.current = null;
      };
      
      audio.play();

    } catch (error) {
      console.error("Error generating audio:", error);
      setAudioState('idle');
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Failed to generate audio. Please try again.',
      });
    }
  };

  const handleFeedback = async (messageId: string, rating: 'like' | 'dislike') => {
    setFeedbackState(prev => ({ ...prev, [rating]: 'loading' }));
    try {
      await submitFeedback({ messageId, rating });
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Feedback Error',
        description: 'Failed to submit feedback. Please try again.',
      });
    } finally {
       // After a short delay, reset the state to allow user to change their mind
      setTimeout(() => {
        setFeedbackState(prev => ({ ...prev, [rating]: 'idle' }));
      }, 1000);
    }
  };


  if (!messages.length) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-4 text-center">
            <div className='p-5 bg-primary/20 rounded-full border-4 border-primary/30 shadow-lg'>
              <Logo className='text-accent' />
            </div>
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-semibold">How can I help you today?</h2>
              <p className="text-muted-foreground max-w-sm">
                Ask me anything from drafting emails to brainstorming ideas. I'm here to assist you.
              </p>
            </div>
        </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative mx-auto max-w-3xl px-4 pt-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              "flex items-start gap-4 py-6",
              message.role === 'user' ? 'justify-end' : ''
            )}
          >
            {message.role !== 'user' && (
              <Avatar className={cn(
                  "h-9 w-9 border-2",
                  "bg-accent text-accent-foreground shadow-sm"
              )}>
                <AvatarFallback className="bg-transparent">
                  <SparrowIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}

            <div className={cn(
              "flex-1 space-y-2 max-w-[85%]",
              message.role === 'user' ? 'order-2 text-right' : ''
            )}>
              <p className="font-bold font-headline text-sm">
                {message.role === 'user' ? 'You' : 'Progress'}
              </p>
              <div className={cn(
                "prose prose-sm max-w-none text-foreground leading-relaxed p-4 rounded-3xl shadow-sm",
                message.role === 'user' ? 'bg-accent text-accent-foreground rounded-br-lg prose-invert' : 'bg-background rounded-bl-lg'
              )}>
                {message.status === 'thinking' ? (
                  <ThinkingIndicator />
                ) : (
                  <Markdown content={message.content || ''} />
                )}
              </div>
              {message.role === 'assistant' && message.status !== 'thinking' && message.content && (
                <div className="flex items-center gap-1 pt-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFeedback(message.id, 'like')} disabled={feedbackState.like === 'loading' || feedbackState.dislike === 'loading'}>
                        <ThumbsUp className="h-4 w-4" />
                        <span className="sr-only">Like</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Like</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFeedback(message.id, 'dislike')} disabled={feedbackState.like === 'loading' || feedbackState.dislike === 'loading'}>
                        <ThumbsDown className="h-4 w-4" />
                        <span className="sr-only">Dislike</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Dislike</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRegenerate}>
                        <RefreshCcw className="h-4 w-4" />
                        <span className="sr-only">Regenerate</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Regenerate</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePlayAudio(message.content)} disabled={audioState === 'loading'}>
                        {audioState === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span className="sr-only">Play audio</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{audioState === 'playing' ? 'Pause' : 'Play audio'}</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <Avatar className={cn(
                  "h-9 w-9 border-2 bg-background shadow-sm",
                  'order-1'
              )}>
                <AvatarFallback className="bg-transparent">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
}
