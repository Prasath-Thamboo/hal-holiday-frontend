import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { placesApi } from '@/lib/api';
import { ApiError } from '@/lib/types';

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

const HALAL_LABELS: Record<number, string> = {
  1: 'Niveau 1 — Auto-déclaré',
  2: 'Niveau 2 — Validé par la mosquée locale',
  3: 'Niveau 3 — Certifié par un organisme agréé',
  4: 'Niveau 4 — 100% Halal',
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary">
            {TYPE_LABELS[place.type] ?? place.type}
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
        <h1 className="text-3xl font-bold tracking-tight">{place.name}</h1>
        <p className="mt-1 text-muted-foreground">{place.address}</p>
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
