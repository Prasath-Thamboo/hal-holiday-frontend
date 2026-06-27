'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/auth/connexion');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <p className="text-muted-foreground text-sm">Chargement…</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Administration</h1>
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </div>
      {children}
    </div>
  );
}
