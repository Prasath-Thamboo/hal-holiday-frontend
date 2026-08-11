import Link from 'next/link';
import { Landmark, Sparkles, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FavoriteButton } from '@/components/favorite-button';
import type { NearbyPlace, Place } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  mosque: 'Mosquée',
  activity: 'Activité',
};

const TYPE_STYLE: Record<
  string,
  { icon: LucideIcon; bar: string; iconBg: string; iconFg: string }
> = {
  restaurant: {
    icon: UtensilsCrossed,
    bar: 'bg-terracotta',
    iconBg: 'bg-terracotta/15',
    iconFg: 'text-terracotta',
  },
  mosque: {
    icon: Landmark,
    bar: 'bg-primary',
    iconBg: 'bg-primary/15',
    iconFg: 'text-primary',
  },
  activity: {
    icon: Sparkles,
    bar: 'bg-gold',
    iconBg: 'bg-gold/20',
    iconFg: 'text-gold',
  },
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
  const typeStyle = TYPE_STYLE[place.type];
  const TypeIcon = typeStyle?.icon;

  return (
    <Link href={`/lieux/${place.slug}`} className="relative block h-full">
      <div className="absolute right-2 top-3 z-10">
        <FavoriteButton placeId={place.id} />
      </div>
      <Card className="h-full overflow-hidden gap-0 pt-0 transition-shadow hover:shadow-md">
        <div className={`h-1.5 ${typeStyle?.bar ?? 'bg-muted'}`} />
        <CardHeader className="pt-4 pb-2">
          <div className="flex items-start gap-3">
            {TypeIcon && (
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${typeStyle.iconBg}`}>
                <TypeIcon className={`size-4 ${typeStyle.iconFg}`} strokeWidth={2} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 pr-8">
                <h3 className="font-medium leading-tight">{place.name}</h3>
                {distanceM !== null && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistance(distanceM)}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
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
            </div>
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
