'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
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
                <RadioGroup defaultValue="light" className="flex items-center gap-4">
                  <div>
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="ml-2">Light</Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="ml-2">Dark</Label>
                  </div>
                   <div>
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="ml-2">System</Label>
                  </div>
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
