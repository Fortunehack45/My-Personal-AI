'use client';

import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmitted(true);
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox.`,
      });
    } catch (error: any) {
      // We don't want to reveal if an email exists or not for security reasons.
      // So we show the same message for success and "user not found" errors.
      if (error.code === 'auth/user-not-found') {
        setIsSubmitted(true);
        toast({
          title: 'Password Reset Email Sent',
          description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl rounded-2xl">
        <CardHeader className="items-center text-center space-y-4">
          <Logo className="mb-4" />
          <CardTitle className="font-headline text-3xl">Forgot Password</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "Please check your email for a reset link."
              : "Enter your email to receive a password reset link."
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {!isSubmitted && (
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
            )}
          </CardContent>
          <CardFooter className='flex-col gap-4'>
            {!isSubmitted && (
              <Button type="submit" className="w-full font-headline text-base" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            )}
             <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
