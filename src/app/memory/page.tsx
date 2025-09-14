'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BrainCircuit, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const MemoryPageSkeleton = () => (
    <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-7 w-40" />
                    </CardTitle>
                    <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-28 ml-auto" />
                </CardFooter>
            </Card>
        </div>
    </div>
);

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
    return <MemoryPageSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
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
                You can add notes, preferences, or any other information here that you want the AI to remember for future conversations. This is a simple text-based memory.
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
