'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            Hal Holiday
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <Link
              href="/lieux"
              className={
                pathname.startsWith('/lieux')
                  ? 'text-foreground'
                  : 'hover:text-foreground'
              }
            >
              Lieux
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading &&
            (user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void logout()}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/connexion">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/inscription">
                  <Button size="sm">Inscription</Button>
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
