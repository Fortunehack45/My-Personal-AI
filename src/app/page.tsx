'use client';

import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { loading } = useAuth();

  if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p>Loading...</p>
        </div>
      );
  }

  // The AuthProvider will handle redirection, so this component can be minimal.
  return null;
}
