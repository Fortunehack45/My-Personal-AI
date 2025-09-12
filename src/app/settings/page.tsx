'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Monitor, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

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
