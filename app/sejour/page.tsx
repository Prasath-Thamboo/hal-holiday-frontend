'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarDays, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { tripsApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { dayCount, formatDateRange } from '@/lib/trip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function SejourPage() {
  const { user, accessToken, isLoading } = useAuth();
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: trips, isLoading: loadingTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsApi.list(accessToken!),
    enabled: !!accessToken,
  });

  const create = useMutation({
    mutationFn: (payload: { title: string; startDate: string; endDate: string }) =>
      tripsApi.create(payload, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trips'] });
      setShowForm(false);
      toast.success(t('planning.new_trip'));
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Erreur'),
  });

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold tracking-tight">{t('planning.title')}</h1>
        <p className="mb-6 text-muted-foreground">{t('planning.sign_in')}</p>
        <Link href="/auth/connexion">
          <Button>{t('nav.login')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('planning.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('planning.subtitle')}</p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="size-3.5" />
            {t('planning.new_trip')}
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            create.mutate({
              title: String(fd.get('title') ?? '').trim(),
              startDate: String(fd.get('startDate')),
              endDate: String(fd.get('endDate')),
            });
          }}
          className="mb-6 space-y-4 rounded-xl border border-border bg-card p-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">{t('planning.trip_title')}</Label>
            <Input id="title" name="title" required maxLength={120} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">{t('planning.start_date')}</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={todayISO()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">{t('planning.end_date')}</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
                defaultValue={todayISO(2)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={create.isPending}>
              {t('planning.create')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              {t('planning.cancel')}
            </Button>
          </div>
        </form>
      )}

      {loadingTrips && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {trips && trips.length === 0 && !showForm && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t('planning.no_trips')}
        </p>
      )}

      <div className="space-y-3">
        {trips?.map((trip) => (
          <Link
            key={trip.id}
            href={`/sejour/${trip.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarDays className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{trip.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateRange(trip.startDate, trip.endDate, locale)} ·{' '}
                  {t(
                    dayCount(trip.startDate, trip.endDate) > 1
                      ? 'planning.days_plural'
                      : 'planning.days',
                    { n: dayCount(trip.startDate, trip.endDate) },
                  )}{' '}
                  ·{' '}
                  {t(trip.itemCount > 1 ? 'planning.places_plural' : 'planning.places', {
                    n: trip.itemCount,
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
