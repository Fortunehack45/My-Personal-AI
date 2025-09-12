
'use client';

import { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Paperclip, Mic, Square, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type MessageComposerProps = {
  onSendMessage: (message: string, attachmentDataUri?: string) => void;
  isLoading?: boolean;
};

type RecordingState = 'idle' | 'recording' | 'transcribing';

export function MessageComposer({ onSendMessage, isLoading }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<{ type: 'image'; dataUri: string; name: string } | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (message.trim() || attachment) {
      onSendMessage(message.trim(), attachment?.dataUri);
      setMessage('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          setAttachment({ type: 'image', dataUri: loadEvent.target?.result as string, name: file.name });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Currently, only image files are supported.',
        });
      }
    }
     // Reset file input value to allow re-selection of the same file
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
            <div className="flex-1 flex flex-col gap-2">
                {attachment && (
                    <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                        <Image src={attachment.dataUri} alt={attachment.name} fill className="object-cover" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-6 w-6 text-white bg-black/50 hover:bg-black/75"
                            onClick={() => setAttachment(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                 <div className="flex items-center gap-2">
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

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" size="icon" variant="ghost" className="h-10 w-10 shrink-0 rounded-full text-muted-foreground" disabled={anyLoading} onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="h-5 w-5" />
                                <span className="sr-only">Attach file</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach image</TooltipContent>
                    </Tooltip>
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
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="submit"
                                size="icon"
                                variant="default"
                                className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                                disabled={(!message.trim() && !attachment) || anyLoading}
                                onClick={handleSendMessage}
                            >
                                <SendHorizonal className="h-5 w-5" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                    </Tooltip>
                 </div>
            </div>
        </div>
    </TooltipProvider>
  );
}
