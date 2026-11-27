'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton } from '@/components/favorite-button';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { placesApi } from '@/lib/api';
import { halalFull, halalTag, HALAL_SLIDER_MARKS } from '@/lib/halal';
import { todaySummary, weekRows, formatSlots } from '@/lib/opening-hours';
import type { NearbyPlace, PlaceCategory, PlaceType } from '@/lib/types';

const PlaceMap = dynamic(
  () => import('@/components/place-map').then((m) => m.PlaceMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[70vh] w-full rounded-xl" />,
  },
);

// Centre de Paris — fallback si la géolocalisation est refusée/indisponible.
const PARIS: { lat: number; lng: number } = { lat: 48.8566, lng: 2.3522 };

type SubType = 'mosque' | 'restaurant' | 'touristique' | 'divertissement';

const SUBTYPE_OPTIONS: { value: SubType; labelKey: string }[] = [
  { value: 'mosque', labelKey: 'carte.filter_mosque' },
  { value: 'restaurant', labelKey: 'carte.filter_restaurant' },
  { value: 'touristique', labelKey: 'carte.filter_tourism' },
  { value: 'divertissement', labelKey: 'carte.filter_entertainment' },
];

const RADIUS_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
];

function toQuery(subtypes: Set<SubType>): {
  types?: PlaceType[];
  categories?: PlaceCategory[];
} {
  if (subtypes.size === 0) return {};
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

export default function CartePage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const [subtypes, setSubtypes] = useState<Set<SubType>>(new Set());
  const [halalOverride, setHalalOverride] = useState<number | null>(null);
  const [noAlcohol, setNoAlcohol] = useState(false);
  const [radius, setRadius] = useState(2000);
  const [selected, setSelected] = useState<NearbyPlace | null>(null);

  // Défaut = préférence de rigueur halal du profil (chargée avec l'auth),
  // tant que l'utilisateur n'a pas déplacé le curseur lui-même.
  const profileHalal = user?.halalStrictnessPreference ?? null;
  const minHalal = halalOverride ?? profileHalal ?? 1;

  // Géolocalisation avec repli sur Paris.
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture navigateur post-hydratation (SSR-safe)
      setCoords(PARIS);
      setUsingFallback(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setCoords(PARIS);
        setUsingFallback(true);
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  const { types, categories } = useMemo(() => toQuery(subtypes), [subtypes]);

  const { data: places, isLoading } = useQuery({
    queryKey: ['carte', coords, types, categories, minHalal, noAlcohol, radius],
    queryFn: () =>
      placesApi.nearby({
        lat: coords!.lat,
        lng: coords!.lng,
        radius,
        types,
        categories,
        minHalal: minHalal > 1 ? minHalal : undefined,
        noAlcohol: noAlcohol || undefined,
      }),
    enabled: !!coords,
    staleTime: 30_000,
  });

  function toggleSubtype(value: SubType) {
    setSubtypes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('carte.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {usingFallback
              ? t('carte.subtitle_fallback')
              : t('carte.subtitle_around_you')}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {SUBTYPE_OPTIONS.map(({ value, labelKey }) => {
            const active = subtypes.has(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleSubtype(value)}
                className={[
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
                ].join(' ')}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Curseur rigueur halal */}
          <div>
            <label htmlFor="halal" className="text-sm font-medium">
              {t('carte.halal_min')}
            </label>
            <input
              id="halal"
              type="range"
              min={1}
              max={4}
              step={1}
              value={minHalal}
              onChange={(e) => setHalalOverride(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {HALAL_SLIDER_MARKS.find((m) => m.value === minHalal)?.label}
              {halalOverride === null &&
                profileHalal !== null &&
                ` · ${t('carte.halal_from_profile')}`}
            </p>
          </div>

          {/* Rayon */}
          <div>
            <label htmlFor="radius" className="text-sm font-medium">
              {t('carte.radius')}
            </label>
            <select
              id="radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="mt-2 h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sans alcool */}
          <label className="flex items-end gap-2 pb-1 text-sm">
            <Checkbox
              checked={noAlcohol}
              onCheckedChange={(v) => setNoAlcohol(v === true)}
            />
            {t('carte.hide_alcohol')}
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Carte */}
        <div>
          {!coords || isLoading ? (
            <Skeleton className="h-[70vh] w-full rounded-xl" />
          ) : (
            <PlaceMap
              places={places ?? []}
              userCoords={coords}
              selectedId={selected?.id ?? null}
              onSelect={(p) => setSelected(p)}
            />
          )}
          {places && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t(places.length > 1 ? 'carte.count_plural' : 'carte.count', {
                n: places.length,
              })}
            </p>
          )}
        </div>

        {/* Panneau détail */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          {selected ? (
            <PlaceDetailPanel
              place={selected}
              onClose={() => setSelected(null)}
              t={t}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {t('carte.pick_marker')}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function PlaceDetailPanel({
  place,
  onClose,
  t,
}: {
  place: NearbyPlace;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  const tag = halalTag(place.halal_level);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold leading-tight">{place.name}</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label={t('common.close')}
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tag && <Badge>{tag}</Badge>}
        {place.category && (
          <Badge variant="secondary">
            {place.category === 'touristique'
              ? t('carte.filter_tourism')
              : t('carte.filter_entertainment')}
          </Badge>
        )}
        {place.prayer_room && <Badge variant="outline">{t('carte.prayer_room')}</Badge>}
        {place.serves_alcohol && (
          <Badge variant="destructive">{t('carte.serves_alcohol')}</Badge>
        )}
      </div>

      <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" />
        <p>{place.address}</p>
      </div>

      {place.opening_hours ? (
        <div>
          <p className="text-sm font-medium">{todaySummary(place.opening_hours)}</p>
          <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
            {weekRows(place.opening_hours).map((row) => (
              <li
                key={row.day}
                className={row.isToday ? 'font-medium text-foreground' : undefined}
              >
                <span className="inline-block w-20">{row.label}</span>
                {formatSlots(row.slots)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t('carte.hours_none')}</p>
      )}

      {place.halal_level && (
        <p className="text-xs text-muted-foreground">{halalFull(place.halal_level)}</p>
      )}

      {place.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {place.description}
        </p>
      )}

      <Separator />

      <div className="flex items-center gap-2">
        <Link href={`/lieux/${place.slug}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            {t('carte.full_sheet')}
          </Button>
        </Link>
        <a href={directionsUrl} target="_blank" rel="noreferrer">
          <Button size="sm" className="gap-1.5">
            <Navigation className="size-3.5" />
            {t('carte.directions')}
          </Button>
        </a>
        <FavoriteButton
          placeId={place.id}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted disabled:opacity-60"
        />
      </div>
    </div>
  );
}
