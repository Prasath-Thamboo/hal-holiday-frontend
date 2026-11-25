'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n';
import { Toaster } from '@/components/ui/sonner';

/** Passe la langue du profil connecté au provider i18n. */
function I18nBridge({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <I18nProvider userLocale={user?.language}>{children}</I18nProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nBridge>
          {children}
          <Toaster richColors position="top-right" />
        </I18nBridge>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
