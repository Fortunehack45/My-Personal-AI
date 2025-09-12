'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BrainCircuit, Save } from 'lucide-react';

export default function MemoryPage() {
  const { userProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [memory, setMemory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setMemory(userProfile.memory || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile({ memory });
      toast({
        title: 'Memory Updated',
        description: 'The AI will now remember this information.',
      });
    } catch (error) {
      console.error('Failed to update memory', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your memory.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="p-4 md:p-8">
        <p>Loading memory...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl">AI Memory</h1>
                <p className="text-muted-foreground">Help the AI remember things about you.</p>
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
            <CardTitle className='flex items-center gap-2'>
              <BrainCircuit className="h-6 w-6" />
              <span>Personal Memory</span>
            </CardTitle>
            <CardDescription>
                You can add notes, preferences, or any other information here that you want the AI to remember for future conversations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="e.g., I'm a software developer who loves cats. My favorite color is blue..."
              className="min-h-[200px] text-base"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isLoading} className='ml-auto'>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
