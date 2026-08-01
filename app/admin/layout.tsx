'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/lieux', label: 'Lieux' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Administration</h1>
          <nav className="flex gap-4 text-sm">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  pathname === href
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </div>
      {children}
    </div>
  );
}
