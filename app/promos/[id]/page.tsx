'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import { promotionsApi } from '@/lib/api';

export default function PromoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t, locale } = useI18n();

  const { data: promo, isLoading, isError } = useQuery({
    queryKey: ['promotion', id],
    queryFn: () => promotionsApi.get(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }
  if (isError || !promo) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
        <p className="mb-4">404</p>
        <Link href="/promos" className="text-primary underline">
          {t('promos.back')}
        </Link>
      </div>
    );
  }

  const fmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const ended = new Date(`${promo.endDate}T23:59:59Z`) < new Date();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/promos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {t('promos.back')}
      </Link>

      {promo.imageUrl && (
        <div className="mb-5 aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={promo.imageUrl} alt="" className="size-full object-cover" />
        </div>
      )}

      <div className="mb-2 flex flex-wrap gap-1.5">
        {ended ? (
          <Badge variant="destructive">{t('promos.ended')}</Badge>
        ) : (
          <Badge>
            {t('promos.valid_until', {
              date: fmt.format(new Date(`${promo.endDate}T00:00:00Z`)),
            })}
          </Badge>
        )}
        {promo.code && (
          <Badge variant="outline" className="gap-1">
            <Tag className="size-3" />
            {t('promos.code')} {promo.code}
          </Badge>
        )}
      </div>

      <h1 className="text-3xl font-bold tracking-tight">{promo.title}</h1>

      <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" />
        <span>
          {promo.place.name} — {promo.place.address}
        </span>
      </div>

      <Separator className="my-6" />

      {promo.description && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {promo.description}
        </p>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        {fmt.format(new Date(`${promo.startDate}T00:00:00Z`))} —{' '}
        {fmt.format(new Date(`${promo.endDate}T00:00:00Z`))}
      </p>

      <Link href={`/lieux/${promo.place.slug}`} className="mt-6 inline-block">
        <Button variant="outline" size="sm">
          {t('promos.see_place')}
        </Button>
      </Link>
    </div>
  );
}
