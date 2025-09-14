'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, MapPin, Calendar as CalendarIcon, Phone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type Geolocation = {
  latitude: number;
  longitude: number;
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState<Date | undefined>();
  const [location, setLocation] = useState<Geolocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const handleLocation = () => {
    setIsLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast({
            title: 'Location Accessed',
            description: 'Your location has been successfully recorded.',
          });
          setIsLocationLoading(false);
        },
        (error) => {
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not access your location. Please enable location services in your browser.',
          });
          setIsLocationLoading(false);
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Location Error',
        description: 'Geolocation is not supported by this browser.',
      });
      setIsLocationLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
        toast({
            variant: 'destructive',
            title: 'Missing Fields',
            description: 'Please fill out all required fields.',
        });
        return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        phoneNumber,
        dob: dob ? dob.toISOString() : null,
        location,
        voice: 'erinome',
        memory: '',
        voiceModeEnabled: false,
      });

      toast({
        title: 'Signup Successful',
        description: 'You can now log in.',
      });
      router.push('/login');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardHeader className="items-center text-center space-y-4">
          <Logo className="mb-4" />
          <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
          <CardDescription>Join Progress to start your AI journey.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

             <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative flex items-center">
                    <Phone className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phoneNumber" type="tel" placeholder="(123) 456-7890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="pl-10" />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !dob && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        initialFocus
                        captionLayout='dropdown-buttons'
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        />
                    </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Button id="location" type="button" variant='outline' className='w-full' onClick={handleLocation} disabled={isLocationLoading}>
                    <MapPin className='mr-2 h-4 w-4' />
                    {isLocationLoading ? 'Accessing...' : location ? 'Location Saved' : 'Access Location'}
                </Button>
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full font-headline text-base bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <p className='text-sm text-muted-foreground'>
              Already have an account?{' '}
              <Link href="/login" className='font-medium text-primary hover:underline'>
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
