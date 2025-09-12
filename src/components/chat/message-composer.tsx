'use client';

import { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Paperclip, Mic, Square } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';

type MessageComposerProps = {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
};

type RecordingState = 'idle' | 'recording' | 'transcribing';

export function MessageComposer({ onSendMessage, isLoading }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setRecordingState('transcribing');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const { transcription } = await speechToText({ audioDataUri: base64Audio });
            setMessage(prev => prev ? `${prev} ${transcription}` : transcription);
          } catch (error) {
            console.error('Error transcribing audio:', error);
            toast({
              variant: 'destructive',
              title: 'Transcription Failed',
              description: 'Could not transcribe the audio. Please try again.',
            });
          } finally {
            setRecordingState('idle');
          }
        };
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone Error',
        description: 'Could not access the microphone. Please check your browser permissions.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleMicClick = () => {
    if (recordingState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = '0px';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [message, textareaRef]);

  const anyLoading = isLoading || recordingState === 'transcribing';

  return (
    <TooltipProvider>
        <div className="flex w-full items-end gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost"
                      className={cn("h-10 w-10 shrink-0 rounded-full text-muted-foreground", recordingState === 'recording' && 'text-destructive animate-pulse')}
                      onClick={handleMicClick}
                      disabled={anyLoading}
                    >
                        {recordingState === 'recording' ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        <span className="sr-only">{recordingState === 'recording' ? 'Stop recording' : 'Start recording'}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{recordingState === 'recording' ? 'Stop recording' : 'Start recording'}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 shrink-0 rounded-full text-muted-foreground" disabled={anyLoading}>
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Attach file</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file (coming soon)</TooltipContent>
            </Tooltip>
            <div className="relative flex-1">
                 <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={recordingState === 'transcribing' ? 'Transcribing...' : "Ask Progress anything..."}
                    className="min-h-[40px] max-h-48 w-full rounded-2xl resize-none bg-background border shadow-sm px-4 py-2 text-base"
                    rows={1}
                    disabled={anyLoading}
                />
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="submit"
                        size="icon"
                        variant="default"
                        className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!message.trim() || anyLoading}
                        onClick={handleSendMessage}
                    >
                        <SendHorizonal className="h-5 w-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
            </Tooltip>
        </div>
    </TooltipProvider>
  );
}
