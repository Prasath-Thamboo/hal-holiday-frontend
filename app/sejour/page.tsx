import type { Metadata } from 'next';
import Link from 'next/link';
import { Landmark, Sparkles, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { PlaceCard } from '@/components/place-card';
import { placesApi } from '@/lib/api';
import type { PlaceType } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Prévoir mon séjour — Hal Holiday',
  description: 'Un guide rapide pour organiser votre séjour halal à Paris : où manger, où prier, et quoi visiter.',
};

const SECTIONS: {
  type: PlaceType;
  title: string;
  icon: LucideIcon;
  iconBg: string;
  iconFg: string;
}[] = [
  { type: 'restaurant', title: 'Où manger', icon: UtensilsCrossed, iconBg: 'bg-terracotta/15', iconFg: 'text-terracotta' },
  { type: 'mosque', title: 'Où prier', icon: Landmark, iconBg: 'bg-primary/15', iconFg: 'text-primary' },
  { type: 'activity', title: 'Quoi visiter', icon: Sparkles, iconBg: 'bg-gold/20', iconFg: 'text-gold' },
];

const HALAL_LEVELS = [
  { level: 1, label: 'Déclaratif', description: "Le lieu se déclare halal sans certification tierce." },
  { level: 2, label: 'Validé mosquée', description: 'Recommandé par une mosquée locale.' },
  { level: 3, label: 'Certifié', description: 'Certifié par un organisme de certification halal agréé.' },
  { level: 4, label: '100% Halal', description: "L'établissement est entièrement halal, sans exception." },
];

const SECTION_LIMIT = 6;

export default async function SejourPage() {
  const results = await Promise.all(
    SECTIONS.map((section) => placesApi.list({ types: [section.type], limit: SECTION_LIMIT, published: true })),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Prévoir mon séjour</h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Un guide rapide pour organiser votre séjour halal à Paris : où manger, où prier, et quoi visiter.
        </p>
      </div>

      {/* Légende des niveaux halal */}
      <div className="mb-12 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Comprendre les niveaux halal
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {HALAL_LEVELS.map(({ level, label, description }) => (
            <div key={level} className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {level}
              </span>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections par type */}
      <div className="space-y-12">
        {SECTIONS.map((section, i) => {
          const { data, meta } = results[i];
          const Icon = section.icon;
          return (
            <div key={section.type}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex size-9 items-center justify-center rounded-full ${section.iconBg}`}>
                    <Icon className={`size-4 ${section.iconFg}`} strokeWidth={2} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
                </div>
                {meta.total > SECTION_LIMIT && (
                  <Link
                    href={`/lieux?types=${section.type}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Voir tout ({meta.total})
                  </Link>
                )}
              </div>

              {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun lieu publié pour le moment.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
