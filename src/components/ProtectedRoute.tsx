"use client";
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If not loading, no user is present, and we are not already on an auth page, redirect to login
    if (!loading && !user && pathname !== '/login' && pathname !== '/register') {
      router.replace('/login');
    }
    // If user is present but trying to hit login/register, go to home
    if (!loading && user && (pathname === '/login' || pathname === '/register')) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  // If still fetching session and trying to hit a protected page, show a small loader to prevent UI flash
  if (loading && pathname !== '/login' && pathname !== '/register') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Prevent rendering protected content if not logged in
  if (!user && pathname !== '/login' && pathname !== '/register') {
    return null; 
  }

  return <>{children}</>;
}
