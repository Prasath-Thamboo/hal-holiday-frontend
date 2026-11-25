'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoonStar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5 font-heading text-lg font-semibold text-primary">
            <MoonStar className="size-4" strokeWidth={2.25} />
            Hal Holiday
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <Link
              href="/carte"
              className={
                pathname.startsWith('/carte')
                  ? 'font-medium text-foreground'
                  : 'hover:text-foreground'
              }
            >
              {t('nav.carte')}
            </Link>
            <Link
              href="/lieux"
              className={
                pathname.startsWith('/lieux')
                  ? 'font-medium text-foreground'
                  : 'hover:text-foreground'
              }
            >
              {t('nav.lieux')}
            </Link>
            <Link
              href="/sejour"
              className={
                pathname.startsWith('/sejour')
                  ? 'font-medium text-foreground'
                  : 'hover:text-foreground'
              }
            >
              {t('nav.sejour')}
            </Link>
            <Link
              href="/promos"
              className={
                pathname.startsWith('/promos')
                  ? 'font-medium text-foreground'
                  : 'hover:text-foreground'
              }
            >
              {t('nav.promos')}
            </Link>
            {user && (
              <Link
                href="/favoris"
                className={
                  pathname.startsWith('/favoris')
                    ? 'font-medium text-foreground'
                    : 'hover:text-foreground'
                }
              >
                {t('nav.favoris')}
              </Link>
            )}
            {user && (
              <Link
                href="/profil"
                className={
                  pathname.startsWith('/profil')
                    ? 'font-medium text-foreground'
                    : 'hover:text-foreground'
                }
              >
                {t('nav.profil')}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading &&
            (user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      {t('nav.admin')}
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void logout()}
                >
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/connexion">
                  <Button variant="ghost" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/auth/inscription">
                  <Button size="sm">{t('nav.register')}</Button>
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
