'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin } from 'lucide-react';
import { PlaceCard } from '@/components/place-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { placesApi } from '@/lib/api';

export default function HomePage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState<string | null>(null);

  const { data: places, isLoading } = useQuery({
    queryKey: ['nearby', coords],
    queryFn: () =>
      placesApi.nearby({ lat: coords!.lat, lng: coords!.lng, radius: 2000 }),
    enabled: !!coords,
    staleTime: 30_000,
  });

  const locate = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('La géolocalisation n’est pas supportée par ce navigateur.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError("Impossible d'accéder à votre position."),
    );
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Découvrez les lieux halal à Paris
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Restaurants, mosquées et activités sans alcool — certifiés et
          géolocalisés.
        </p>
        <Button size="lg" onClick={locate} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Recherche en cours…
            </>
          ) : (
            <>
              <MapPin />
              Rechercher près de moi
            </>
          )}
        </Button>
        {geoError && (
          <p className="mt-3 text-sm text-destructive">{geoError}</p>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {places && places.length === 0 && (
        <p className="text-center text-muted-foreground">
          Aucun lieu trouvé dans un rayon de 2 km.
        </p>
      )}

      {places && places.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {places.length} lieu{places.length > 1 ? 'x' : ''} trouvé
            {places.length > 1 ? 's' : ''} près de vous
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
