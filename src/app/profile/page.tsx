'use client';

import Link from 'next/link';
import { useAuth, UserProfile } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Gift, MapPin, ArrowLeft, Phone, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  dob: z.date().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePageSkeleton = () => (
    <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
            <Card>
                <CardHeader className="border-b">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="text-center md:text-left">
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-5 w-56" />
                        </div>
                        <div className="md:ml-auto">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24 mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-24 mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function ProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dob: undefined,
    },
  });
  
  useEffect(() => {
    if (userProfile) {
      reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phoneNumber: userProfile.phoneNumber || '',
        dob: userProfile.dob ? new Date(userProfile.dob) : undefined,
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const profileUpdate: Partial<UserProfile> = {
        ...data,
        dob: data.dob?.toISOString(),
      };
      await updateUserProfile(profileUpdate);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
      });
    }
  };

  if (authLoading || !user || !userProfile) {
    return <ProfilePageSkeleton />;
  }

  const userInitial = userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl">My Profile</h1>
            <p className="text-muted-foreground">View and manage your personal details.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/chat">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row items-center gap-6">
                 <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarFallback className="text-4xl">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <CardTitle className="font-headline text-3xl">{userProfile.firstName} {userProfile.lastName}</CardTitle>
                  <CardDescription className='flex items-center gap-2 justify-center md:justify-start'>
                    <Mail className="h-4 w-4" />
                    {userProfile.email}
                  </CardDescription>
                </div>
                <div className="md:ml-auto">
                   {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        {isEditing ? (
                            <>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    render={({ field }) => <Input id="firstName" {...field} />}
                                />
                                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                            </>
                        ) : (
                            <p className="text-muted-foreground">{userProfile.firstName}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                         {isEditing ? (
                            <>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    render={({ field }) => <Input id="lastName" {...field} />}
                                />
                                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                            </>
                        ) : (
                           <p className="text-muted-foreground">{userProfile.lastName}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                         {isEditing ? (
                             <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative flex items-center">
                                        <Phone className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="phoneNumber" type="tel" placeholder="(123) 456-7890" {...field} className="pl-10" />
                                    </div>
                                )}
                            />
                        ) : (
                           <p className="text-muted-foreground">{userProfile.phoneNumber || 'Not provided'}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        {isEditing ? (
                             <Controller
                                name="dob"
                                control={control}
                                render={({ field }) => (
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                            >
                                                <Gift className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                                captionLayout='dropdown-buttons'
                                                fromYear={1900}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        ) : (
                           <p className="text-muted-foreground">{userProfile.dob ? format(new Date(userProfile.dob), "PPP") : 'Not provided'}</p>
                        )}
                    </div>
                </div>

                {userProfile.location && (
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-5 w-5" />
                            <span>Latitude: {userProfile.location.latitude.toFixed(4)}, Longitude: {userProfile.location.longitude.toFixed(4)}</span>
                        </div>
                    </div>
                 )}
            </CardContent>
            {isEditing && (
                <CardFooter className="border-t bg-muted/50 px-6 py-4 flex justify-end gap-2">
                     <Button variant="outline" onClick={() => { setIsEditing(false); reset(); }}>Cancel</Button>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>}
                    </Button>
                </CardFooter>
            )}
          </Card>
        </form>
      </div>
    </div>
  );
}
