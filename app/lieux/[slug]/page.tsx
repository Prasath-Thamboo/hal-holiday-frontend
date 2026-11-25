import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Landmark, MapPin, Navigation, Sparkles, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FavoriteButton } from '@/components/favorite-button';
import { placesApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { formatSlots, todaySummary, weekRows } from '@/lib/opening-hours';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const place = await placesApi.bySlug(slug);
    return { title: `${place.name} — Hal Holiday` };
  } catch {
    return { title: 'Lieu introuvable — Hal Holiday' };
  }
}

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  mosque: 'Mosquée',
  activity: 'Activité',
};

const TYPE_STYLE: Record<
  string,
  { icon: LucideIcon; iconBg: string; iconFg: string }
> = {
  restaurant: { icon: UtensilsCrossed, iconBg: 'bg-terracotta/15', iconFg: 'text-terracotta' },
  mosque: { icon: Landmark, iconBg: 'bg-primary/15', iconFg: 'text-primary' },
  activity: { icon: Sparkles, iconBg: 'bg-gold/20', iconFg: 'text-gold' },
};

const HALAL_LABELS: Record<number, string> = {
  1: 'Niveau 1 — Auto-déclaré',
  2: 'Niveau 2 — Validé par la mosquée locale',
  3: 'Niveau 3 — Certifié par un organisme agréé',
  4: 'Niveau 4 — 100% Halal',
};

const CATEGORY_LABELS: Record<string, string> = {
  touristique: 'Lieu touristique',
  divertissement: 'Lieu de divertissement',
};

export default async function PlaceDetailPage({ params }: Props) {
  const { slug } = await params;

  let place;
  try {
    place = await placesApi.bySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const typeStyle = TYPE_STYLE[place.type];
  const TypeIcon = typeStyle?.icon;
  const directionsUrl =
    place.latitude && place.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/lieux"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Tous les lieux
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        {TypeIcon && (
          <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${typeStyle.iconBg}`}>
            <TypeIcon className={`size-5 ${typeStyle.iconFg}`} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge variant="secondary">
              {(place.category && CATEGORY_LABELS[place.category]) ??
                TYPE_LABELS[place.type] ??
                place.type}
            </Badge>
            {place.halal_level && (
              <Badge>{HALAL_LABELS[place.halal_level]}</Badge>
            )}
            {place.prayer_room && (
              <Badge variant="outline">Salle de prière</Badge>
            )}
            {place.serves_alcohol && (
              <Badge variant="destructive">Sert de l&apos;alcool</Badge>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{place.name}</h1>
            <FavoriteButton
              placeId={place.id}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted disabled:opacity-60"
            />
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <p>{place.address}</p>
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Navigation className="size-3.5" />
            Itinéraire
          </a>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Description */}
      {place.description && (
        <div className="mb-6">
          <h2 className="mb-2 font-semibold">À propos</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {place.description}
          </p>
        </div>
      )}

      {/* Horaires d'ouverture */}
      {place.opening_hours && (
        <div className="mb-6">
          <h2 className="mb-2 font-semibold">Horaires</h2>
          <p className="mb-2 text-sm font-medium">
            {todaySummary(place.opening_hours)}
          </p>
          <ul className="space-y-0.5 text-sm text-muted-foreground">
            {weekRows(place.opening_hours).map((row) => (
              <li
                key={row.day}
                className={row.isToday ? 'font-medium text-foreground' : undefined}
              >
                <span className="inline-block w-24">{row.label}</span>
                {formatSlots(row.slots)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Arrondissement</span>
          <p className="text-muted-foreground">{place.arrondissement}e</p>
        </div>
        <div>
          <span className="font-medium">Ville</span>
          <p className="text-muted-foreground">{place.city}</p>
        </div>
        {place.halal_level && (
          <div className="col-span-2">
            <span className="font-medium">Certification halal</span>
            <p className="text-muted-foreground">
              {HALAL_LABELS[place.halal_level]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
