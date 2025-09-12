'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getFeedback, Feedback } from '@/ai/flows/admin-get-feedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ThumbsUp, ThumbsDown, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type FeedbackItem = Feedback;

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.email !== 'fortunedomination@gmail.com') {
      router.replace('/chat');
      return;
    }

    const fetchFeedback = async () => {
      try {
        const result = await getFeedback();
        setFeedback(result.feedback);
      } catch (e: any) {
        console.error("Failed to fetch feedback:", e);
        setError("Failed to fetch feedback. Ensure your server environment is configured correctly. This may be due to a missing or invalid service account key for the Firebase Admin SDK.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [user, loading, router]);
  
  if (loading || (isLoading && !error)) {
    return (
      <div className="flex flex-1 flex-col h-full items-center justify-center">
        <p>Loading Admin Panel...</p>
      </div>
    );
  }
  
  if (!user || user.email !== 'fortunedomination@gmail.com') {
    return null;
  }

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl flex items-center gap-2">
              <ShieldCheck className="h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Review user feedback for AI responses.</p>
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
            <CardTitle>Feedback submissions</CardTitle>
            <CardDescription>
              Here is a list of all feedback submitted by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
               <div className="text-destructive-foreground bg-destructive p-4 rounded-md">
                  <p className="font-bold">Error Loading Feedback</p>
                  <p>{error}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Original Message</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.length > 0 ? (
                    feedback.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant={item.rating === 'like' ? 'secondary' : 'destructive'} className='flex items-center gap-1 w-fit'>
                            {item.rating === 'like' ? <ThumbsUp className='h-3 w-3' /> : <ThumbsDown className='h-3 w-3' />}
                            <span className="capitalize">{item.rating}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{item.reason || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.messageContent}</TableCell>
                        <TableCell className="font-mono text-xs">{item.userId}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No feedback submitted yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
