'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Gift, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();

  if (!user || !userProfile) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="font-headline text-3xl mb-4">Profile</h1>
        <p>Loading user profile...</p>
      </div>
    );
  }
  
  const userInitial = userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-2xl mx-auto mb-4">
             <Button asChild variant="outline">
                <Link href="/chat">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chat
                </Link>
            </Button>
        </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarFallback className="text-4xl">{userInitial}</AvatarFallback>
                </Avatar>
            </div>
          <CardTitle className="font-headline text-3xl">{userProfile.firstName} {userProfile.lastName}</CardTitle>
          <CardDescription>Your personal account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className='text-sm'>
                    <p className="font-medium">Full Name</p>
                    <p className="text-muted-foreground">{userProfile.firstName} {userProfile.lastName}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className='text-sm'>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{userProfile.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Gift className="h-5 w-5 text-muted-foreground" />
                <div className='text-sm'>
                    <p className="font-medium">Age</p>
                    <p className="text-muted-foreground">{userProfile.age}</p>
                </div>
            </div>
            {userProfile.location && (
                <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                     <div className='text-sm'>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">Latitude: {userProfile.location.latitude.toFixed(4)}, Longitude: {userProfile.location.longitude.toFixed(4)}</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
