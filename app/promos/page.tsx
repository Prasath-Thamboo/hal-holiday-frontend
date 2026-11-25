'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PromoCard } from '@/components/promo-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import { promotionsApi } from '@/lib/api';
import type { PlaceType } from '@/lib/types';

const LIMIT = 12;

const TYPE_OPTIONS: { value: PlaceType; labelKey: string }[] = [
  { value: 'restaurant', labelKey: 'carte.filter_restaurant' },
  { value: 'mosque', labelKey: 'carte.filter_mosque' },
  { value: 'activity', labelKey: 'nav.lieux' },
];

export default function PromosPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [arr, setArr] = useState<number | ''>('');
  const [type, setType] = useState<PlaceType | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['promotions', page, arr, type],
    queryFn: () =>
      promotionsApi.list({
        page,
        limit: LIMIT,
        arrondissement: arr === '' ? undefined : arr,
        type: type === '' ? undefined : type,
      }),
    staleTime: 30_000,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">{t('promos.title')}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t('promos.subtitle')}</p>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select
          value={arr}
          onChange={(e) => {
            setArr(e.target.value === '' ? '' : Number(e.target.value));
            setPage(1);
          }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">{t('promos.all_arr')}</option>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {t('promos.arr', { n })}
            </option>
          ))}
        </select>
        {TYPE_OPTIONS.map(({ value, labelKey }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setType((cur) => (cur === value ? '' : value));
              setPage(1);
            }}
            className={[
              'rounded-full border px-3 py-1 text-sm transition-colors',
              type === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
            ].join(' ')}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {t('promos.none')}
        </p>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
          {data.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
