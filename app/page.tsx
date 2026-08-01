'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin } from 'lucide-react';
import { PlaceCard } from '@/components/place-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { placesApi } from '@/lib/api';
import type { PlaceType } from '@/lib/types';

const PlaceMap = dynamic(
  () => import('@/components/place-map').then((m) => m.PlaceMap),
  { ssr: false, loading: () => <Skeleton className="h-[420px] w-full rounded-xl" /> },
);

const TYPE_OPTIONS: { value: PlaceType; label: string }[] = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'mosque', label: 'Mosquées' },
  { value: 'activity', label: 'Activités' },
];

const HALAL_OPTIONS = [
  { value: '', label: 'Tous niveaux' },
  { value: '1', label: 'Niveau 1+' },
  { value: '2', label: 'Niveau 2+' },
  { value: '3', label: 'Certifié' },
  { value: '4', label: '100% Halal' },
];

export default function HomePage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<PlaceType[]>([]);
  const [minHalal, setMinHalal] = useState<number | undefined>(undefined);
  const [noAlcohol, setNoAlcohol] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const { data: places, isLoading } = useQuery({
    queryKey: ['nearby', coords, activeTypes, minHalal, noAlcohol],
    queryFn: () =>
      placesApi.nearby({
        lat: coords!.lat,
        lng: coords!.lng,
        radius: 2000,
        types: activeTypes.length > 0 ? activeTypes : undefined,
        minHalal,
        noAlcohol: noAlcohol || undefined,
      }),
    enabled: !!coords,
    staleTime: 30_000,
  });

  const locate = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError("Impossible d'accéder à votre position."),
    );
  }, []);

  function toggleType(type: PlaceType) {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Découvrez les lieux halal à Paris
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Restaurants, mosquées et activités sans alcool — certifiés et géolocalisés.
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

      {/* Filtres — visibles dès qu'on a des coordonnées */}
      {coords && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Types */}
          <div className="flex gap-2">
            {TYPE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleType(value)}
                className={[
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  activeTypes.includes(value)
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Niveau halal */}
          <select
            value={minHalal ?? ''}
            onChange={(e) =>
              setMinHalal(e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="h-8 rounded-full border border-border bg-transparent px-3 text-sm text-muted-foreground outline-none focus-visible:border-foreground"
          >
            {HALAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Sans alcool */}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={noAlcohol}
              onChange={(e) => setNoAlcohol(e.target.checked)}
              className="rounded border-input"
            />
            Sans alcool
          </label>

          {/* Toggle carte */}
          {places && places.length > 0 && (
            <button
              onClick={() => setShowMap((v) => !v)}
              className="ml-auto rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              {showMap ? 'Masquer la carte' : 'Voir la carte'}
            </button>
          )}
        </div>
      )}

      {/* Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {/* Carte */}
      {showMap && coords && places && places.length > 0 && (
        <div className="mb-6">
          <PlaceMap places={places} userCoords={coords} />
        </div>
      )}

      {/* Résultats */}
      {places && places.length === 0 && (
        <p className="text-center text-muted-foreground">
          Aucun lieu trouvé dans un rayon de 2 km avec ces filtres.
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
