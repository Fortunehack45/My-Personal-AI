'use client';

import { motion } from 'framer-motion';
import type { Message } from '@/lib/data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SparrowIcon, Logo } from '@/components/logo';
import { Markdown } from './markdown';
import { cn } from '@/lib/utils';
import { User, ThumbsUp, ThumbsDown, RefreshCcw, Play, Pause, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useRef, useEffect } from 'react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { submitFeedback } from '@/ai/flows/submit-feedback';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';


type ActiveAudio = {
  messageId: string;
  audioDataUri: string;
};

type MessageListProps = {
  messages: Message[];
  onRegenerate: () => Promise<void>;
  activeAudio: ActiveAudio | null;
  onPlayAudio: (messageId: string, audioDataUri: string) => void;
  onAudioEnded: () => void;
  isNewChat: boolean;
};

type AudioState = 'idle' | 'loading' | 'playing' | 'paused';
type FeedbackState = 'idle' | 'loading';
type FeedbackRating = 'like' | 'dislike';

const ThinkingIndicator = () => (
    <div className="flex items-center gap-2">
        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:-0.3s]" />
        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:-0.15s]" />
        <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse" />
    </div>
);

export function MessageList({ messages, onRegenerate, activeAudio, onPlayAudio, onAudioEnded, isNewChat }: MessageListProps) {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [currentAudioMessageId, setCurrentAudioMessageId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<FeedbackRating, FeedbackState>>({ like: 'idle', dislike: 'idle' });
  const [feedbackReason, setFeedbackReason] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState<{messageId: string, rating: FeedbackRating, messageContent: string} | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const params = useParams();
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId;

  // Effect to play audio when activeAudio prop changes
  useEffect(() => {
    if (activeAudio) {
      if (audioRef.current && currentAudioMessageId === activeAudio.messageId) {
        // If it's the same message, just play if paused
        if (audioRef.current.paused) {
          audioRef.current.play();
        }
      } else {
        // If there's a different audio playing, stop it
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        // Play new audio
        const audio = new Audio(activeAudio.audioDataUri);
        audioRef.current = audio;
        setCurrentAudioMessageId(activeAudio.messageId);

        audio.onplay = () => setAudioState('playing');
        audio.onpause = () => setAudioState(audio.ended ? 'idle' : 'paused');
        audio.onended = () => {
          setAudioState('idle');
          setCurrentAudioMessageId(null);
          audioRef.current = null;
          onAudioEnded();
        };
        audio.play();
      }
    } else {
      // If activeAudio is null, stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        setAudioState('paused');
      }
    }
  }, [activeAudio, onAudioEnded, currentAudioMessageId]);


  const getAudioAndPlay = async (messageId: string, text: string) => {
    setAudioState('loading');
    setCurrentAudioMessageId(messageId);
    try {
      const { audioDataUri } = await textToSpeech({ text, voice: userProfile?.voice });
      onPlayAudio(messageId, audioDataUri);
      return audioDataUri;
    } catch (error: any) {
      console.error("Error generating audio:", error);
      
      let description = 'Failed to generate audio. Please try again.';
      if (error.message && (error.message.includes('429') || error.message.includes('exceeded your current quota'))) {
        description = 'You have exceeded the API quota for audio generation. Please check your plan and billing details.';
      } else if (error.message && error.message.includes('503')) {
        description = 'The audio service is currently busy. Please try again in a moment.';
      }

      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: description,
      });
      setAudioState('idle');
      setCurrentAudioMessageId(null);
      return null;
    }
  };

  const handlePlayPauseClick = (messageId: string, text: string) => {
    if (currentAudioMessageId === messageId && audioRef.current) {
      if (audioState === 'playing') {
        audioRef.current.pause();
      } else if (audioState === 'paused') {
        audioRef.current.play();
      }
    } else {
      getAudioAndPlay(messageId, text);
    }
  };

  const handleDownloadAudio = async (messageId: string, text: string) => {
    let audioDataUri = activeAudio?.messageId === messageId ? activeAudio.audioDataUri : null;
    
    if (!audioDataUri) {
        audioDataUri = await getAudioAndPlay(messageId, text);
    }

    if (!audioDataUri) return;

    const link = document.createElement('a');
    link.href = audioDataUri;
    link.download = 'progress-reply.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const openFeedbackDialog = (messageId: string, rating: FeedbackRating, messageContent: string) => {
    setCurrentFeedback({ messageId, rating, messageContent });
    setIsFeedbackDialogOpen(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!currentFeedback || !user || !conversationId) return;

    const { messageId, rating, messageContent } = currentFeedback;
    setFeedbackState(prev => ({ ...prev, [rating]: 'loading' }));
    setIsFeedbackDialogOpen(false);
    
    try {
      await submitFeedback({ 
        messageId,
        rating,
        reason: feedbackReason,
        conversationId,
        userId: user.uid,
        messageContent,
      });
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
      setFeedbackReason('');
      setCurrentFeedback(null);
      setTimeout(() => {
        setFeedbackState(prev => ({ ...prev, [rating]: 'idle' }));
      }, 1000);
    }
  };

  if (isNewChat && messages.length === 0) {
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
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <div className="relative mx-auto max-w-3xl px-4 pt-4">
          {messages.map((message, index) => {
              const isThisMessagePlaying = audioState === 'playing' && currentAudioMessageId === message.id;
              const isThisMessageLoading = audioState === 'loading' && currentAudioMessageId === message.id;
              
            return (
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openFeedbackDialog(message.id, 'like', message.content)} disabled={feedbackState.like === 'loading' || feedbackState.dislike === 'loading'}>
                          <ThumbsUp className="h-4 w-4" />
                          <span className="sr-only">Like</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Like</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openFeedbackDialog(message.id, 'dislike', message.content)} disabled={feedbackState.like === 'loading' || feedbackState.dislike === 'loading'}>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePlayPauseClick(message.id, message.content)} disabled={isThisMessageLoading}>
                          {isThisMessagePlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          <span className="sr-only">Play audio</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isThisMessagePlaying ? 'Pause' : 'Play audio'}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadAudio(message.id, message.content)} disabled={isThisMessageLoading}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download audio</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download audio</TooltipContent>
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
          )})}
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Please provide a reason for your feedback. This helps us improve the AI.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={feedbackReason}
                onChange={(e) => setFeedbackReason(e.target.value)}
                className="col-span-3"
                placeholder="Optional: Why did you give this rating?"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleFeedbackSubmit}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
