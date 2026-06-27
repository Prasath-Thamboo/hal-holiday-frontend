'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PlaceCard } from '@/components/place-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { placesApi } from '@/lib/api';

const LIMIT = 18;

function LieuxContent() {
  const router = useRouter();
  const params = useSearchParams();
  const page = parseInt(params.get('page') ?? '1', 10);

  const { data, isLoading } = useQuery({
    queryKey: ['places', page],
    queryFn: () => placesApi.list({ page, limit: LIMIT }),
    staleTime: 60_000,
  });

  const setPage = useCallback(
    (p: number) => {
      const sp = new URLSearchParams(params.toString());
      sp.set('page', String(p));
      router.push(`/lieux?${sp.toString()}`);
    },
    [params, router],
  );

  return (
    <>
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {data && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {data.meta.total} lieu{data.meta.total > 1 ? 'x' : ''} au total
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function LieuxPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Tous les lieux</h1>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        }
      >
        <LieuxContent />
      </Suspense>
    </div>
  );
}
