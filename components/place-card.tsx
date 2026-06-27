import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { NearbyPlace, Place } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  mosque: 'Mosquée',
  activity: 'Activité',
};

const HALAL_META: Record<
  number,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  1: { label: 'Déclaratif', variant: 'outline' },
  2: { label: 'Validé mosquée', variant: 'secondary' },
  3: { label: 'Certifié', variant: 'default' },
  4: { label: '100% Halal', variant: 'default' },
};

function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

export function PlaceCard({ place }: { place: Place | NearbyPlace }) {
  const distanceM =
    'distance_m' in place ? parseFloat(place.distance_m) : null;
  const halalMeta = place.halal_level ? HALAL_META[place.halal_level] : null;

  return (
    <Link href={`/lieux/${place.slug}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-tight">{place.name}</h3>
            {distanceM !== null && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDistance(distanceM)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="secondary">
              {TYPE_LABELS[place.type] ?? place.type}
            </Badge>
            {halalMeta && (
              <Badge variant={halalMeta.variant}>{halalMeta.label}</Badge>
            )}
            {place.prayer_room && (
              <Badge variant="outline">Salle de prière</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="truncate text-sm text-muted-foreground">
            {place.address}
          </p>
          {place.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {place.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
