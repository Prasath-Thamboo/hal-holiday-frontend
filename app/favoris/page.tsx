'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { HeartOff } from 'lucide-react';
import { PlaceCard } from '@/components/place-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { favoritesApi } from '@/lib/api';

export default function FavorisPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();

  const { data: places, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list(accessToken!),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Mes favoris</h1>

      {!authLoading && !user && (
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            Connectez-vous pour retrouver vos lieux favoris.
          </p>
          <Link href="/auth/connexion">
            <Button>Se connecter</Button>
          </Link>
        </div>
      )}

      {user && isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {user && places && places.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border p-12 text-center text-muted-foreground">
          <HeartOff className="size-8" />
          <p>Aucun favori pour l&apos;instant. Ajoutez des lieux depuis leur fiche.</p>
        </div>
      )}

      {user && places && places.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
