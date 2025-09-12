'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Monitor, Moon, Sun, Volume2, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Switch } from '@/components/ui/switch';

const voices = ["algenib", "erinome", "gacrux", "iapetus", "schedar", "zubenelgenubi"];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { userProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();

  const handleVoiceChange = async (newVoice: string) => {
    if (!userProfile) return;
    try {
      // Optimistically update UI
      await updateUserProfile({ voice: newVoice });

      toast({
        title: 'Voice Updated',
        description: `The AI voice has been changed to ${newVoice}.`,
      });
      // Play a sample
      const { audioDataUri } = await textToSpeech({ text: `Hello, this is the new ${newVoice} voice.`, voice: newVoice });
      const audio = new Audio(audioDataUri);
      audio.play();

    } catch (error: any) {
      console.error('Failed to update voice', error);
      let description = 'Could not update your voice preference.';
      if (error.message && error.message.includes('429')) {
        description = 'You have exceeded the API quota for audio generation. Please check your plan and billing details.';
      }
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: description,
      });
    }
  };

  const handleVoiceModeToggle = async (enabled: boolean) => {
    if (!userProfile) return;
    try {
        await updateUserProfile({ voiceModeEnabled: enabled });
        toast({
            title: 'Voice Mode Updated',
            description: `AI responses will now ${enabled ? 'be read aloud automatically' : 'not be read aloud automatically'}.`,
        });
    } catch (error) {
        console.error('Failed to update voice mode', error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update your voice mode preference.',
        });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application settings.</p>
            </div>
             <Button asChild variant="outline">
                <Link href="/chat">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chat
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup 
                  defaultValue={theme} 
                  onValueChange={setTheme}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <Label htmlFor="light" className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/50 [&:has([data-state=checked])]:border-ring">
                    <Sun className="h-6 w-6" />
                    <RadioGroupItem value="light" id="light" className="sr-only" />
                    <span>Light</span>
                  </Label>
                  <Label htmlFor="dark" className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/50 [&:has([data-state=checked])]:border-ring">
                    <Moon className="h-6 w-6" />
                    <RadioGroupItem value="dark" id="dark" className="sr-only" />
                    <span>Dark</span>
                  </Label>
                   <Label htmlFor="system" className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/50 [&:has([data-state=checked])]:border-ring">
                    <Monitor className="h-6 w-6" />
                    <RadioGroupItem value="system" id="system" className="sr-only" />
                    <span>System</span>
                  </Label>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>Select the voice for the text-to-speech feature and configure voice mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-mode" className="text-base flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <span>Voice Mode</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Have the AI read its responses out loud automatically.
                  </p>
                </div>
                <Switch
                  id="voice-mode"
                  checked={userProfile?.voiceModeEnabled || false}
                  onCheckedChange={handleVoiceModeToggle}
                />
              </div>
            <RadioGroup
              value={userProfile?.voice || 'algenib'}
              onValueChange={handleVoiceChange}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {voices.map((voice) => (
                <Label
                  key={voice}
                  htmlFor={voice}
                  className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/50 [&:has([data-state=checked])]:border-ring"
                >
                  <Volume2 className="h-6 w-6" />
                  <RadioGroupItem value={voice} id={voice} className="sr-only" />
                  <span className="capitalize">{voice}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Notification settings will be available here in a future update.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
