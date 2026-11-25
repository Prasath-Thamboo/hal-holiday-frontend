'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PlaceCard } from '@/components/place-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { placesApi } from '@/lib/api';
import type { PlaceCategory, PlaceType } from '@/lib/types';

const LIMIT = 18;

type SubType = 'mosque' | 'restaurant' | 'touristique' | 'divertissement';

const SUBTYPE_OPTIONS: { value: SubType; label: string }[] = [
  { value: 'mosque', label: 'Mosquées' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'touristique', label: 'Lieux touristiques' },
  { value: 'divertissement', label: 'Lieux de divertissement' },
];

/** Traduit les sous-types cochés en paramètres `types` + `categories`. */
function toQuery(subtypes: SubType[]): {
  types?: PlaceType[];
  categories?: PlaceCategory[];
} {
  if (subtypes.length === 0) return {};
  const types = new Set<PlaceType>();
  const categories = new Set<PlaceCategory>();
  for (const s of subtypes) {
    if (s === 'mosque' || s === 'restaurant') types.add(s);
    else {
      types.add('activity');
      categories.add(s);
    }
  }
  return {
    types: [...types],
    categories: categories.size ? [...categories] : undefined,
  };
}

function LieuxContent() {
  const router = useRouter();
  const params = useSearchParams();
  const page = parseInt(params.get('page') ?? '1', 10);
  const selected = params.getAll('sub') as SubType[];

  const { types, categories } = toQuery(selected);

  const { data, isLoading } = useQuery({
    queryKey: ['places', page, selected],
    queryFn: () =>
      placesApi.list({ page, limit: LIMIT, published: true, types, categories }),
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

  function toggleSub(value: SubType) {
    const sp = new URLSearchParams(params.toString());
    sp.delete('sub');
    const next = selected.includes(value)
      ? selected.filter((t) => t !== value)
      : [...selected, value];
    next.forEach((t) => sp.append('sub', t));
    sp.set('page', '1');
    router.push(`/lieux?${sp.toString()}`);
  }

  return (
    <>
      {/* Filtres sous-type */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SUBTYPE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => toggleSub(value)}
            className={[
              'rounded-full border px-3 py-1 text-sm transition-colors',
              selected.includes(value)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
        {selected.length > 0 && (
          <button
            onClick={() => {
              const sp = new URLSearchParams(params.toString());
              sp.delete('sub');
              sp.set('page', '1');
              router.push(`/lieux?${sp.toString()}`);
            }}
            className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            Tout afficher
          </button>
        )}
      </div>

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
