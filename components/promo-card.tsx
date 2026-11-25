'use client';

import Link from 'next/link';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import type { Promotion } from '@/lib/types';

export function PromoCard({ promo }: { promo: Promotion }) {
  const { t, locale } = useI18n();
  const until = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${promo.endDate}T00:00:00Z`));

  return (
    <Link
      href={`/promos/${promo.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
        {promo.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promo.imageUrl}
            alt=""
            className="size-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Tag className="size-8" />
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="font-medium leading-tight">{promo.title}</h3>
        <p className="text-sm text-muted-foreground">
          {promo.place.name} · {t('promos.arr', { n: promo.place.arrondissement })}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge variant="secondary">{t('promos.valid_until', { date: until })}</Badge>
          {promo.code && (
            <Badge variant="outline" className="gap-1">
              <Tag className="size-3" />
              {promo.code}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
