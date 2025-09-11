'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // For this skeleton, we'll just redirect to the login page.
    // In a real app, you'd check for an active session.
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p>Loading...</p>
    </div>
  );
}
