'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { favoritesApi, placesApi, tripsApi } from '@/lib/api';
import { ApiError, TRIP_SLOTS, type TripItem, type TripSlot } from '@/lib/types';
import {
  findTimeConflicts,
  formatDateRange,
  formatDayLabel,
  SLOT_I18N_KEY,
} from '@/lib/trip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

type T = (key: string, params?: Record<string, string | number>) => string;

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { accessToken, isLoading } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading: loadingTrip, isError } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripsApi.get(id, accessToken!),
    enabled: !!accessToken,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['trip', id] });

  const updateTrip = useMutation({
    mutationFn: (payload: { title: string; startDate: string; endDate: string }) =>
      tripsApi.update(id, payload, accessToken!),
    onSuccess: () => {
      void invalidate();
      void qc.invalidateQueries({ queryKey: ['trips'] });
      setEditing(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur'),
  });

  const removeTrip = useMutation({
    mutationFn: () => tripsApi.remove(id, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trips'] });
      router.push('/sejour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur'),
  });

  if (isLoading || loadingTrip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        <p className="mb-4">404</p>
        <Link href="/sejour" className="text-primary underline">
          {t('planning.back')}
        </Link>
      </div>
    );
  }

  const { trip, days } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/sejour"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {t('planning.back')}
      </Link>

      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateTrip.mutate({
              title: String(fd.get('title') ?? '').trim(),
              startDate: String(fd.get('startDate')),
              endDate: String(fd.get('endDate')),
            });
          }}
          className="mb-6 space-y-3 rounded-xl border border-border bg-card p-4"
        >
          <Input name="title" defaultValue={trip.title} required maxLength={120} />
          <div className="grid grid-cols-2 gap-3">
            <Input name="startDate" type="date" defaultValue={trip.startDate} required />
            <Input name="endDate" type="date" defaultValue={trip.endDate} required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={updateTrip.isPending}>
              {t('planning.save')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              {t('planning.cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{trip.title}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDateRange(trip.startDate, trip.endDate, locale)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {t('planning.edit')}
            </Button>
            {confirmDelete ? (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive text-destructive"
                disabled={removeTrip.isPending}
                onClick={() => removeTrip.mutate()}
              >
                {t('planning.delete_confirm')}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {days.map((day) => {
          const conflicts = findTimeConflicts(day.items);
          return (
            <section key={day.date}>
              <h2 className="mb-3 font-heading text-lg font-semibold capitalize">
                {formatDayLabel(day.date, locale)}
              </h2>
              {day.items.length === 0 && (
                <p className="mb-3 text-sm text-muted-foreground">{t('planning.empty_day')}</p>
              )}
              {conflicts.size > 0 && (
                <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {t('planning.time_conflict_day')}
                </p>
              )}
              <div className="space-y-4">
                {TRIP_SLOTS.map((slot) => (
                  <SlotSection
                    key={slot}
                    tripId={id}
                    token={accessToken!}
                    date={day.date}
                    slot={slot}
                    items={day.items.filter((it) => it.slot === slot)}
                    conflicts={conflicts}
                    onChanged={invalidate}
                    t={t}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function SlotSection({
  tripId,
  token,
  date,
  slot,
  items,
  conflicts,
  onChanged,
  t,
}: {
  tripId: string;
  token: string;
  date: string;
  slot: TripSlot;
  items: TripItem[];
  conflicts: Set<string>;
  onChanged: () => void;
  t: T;
}) {
  const [picking, setPicking] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  async function drop(targetIndex: number) {
    const id = dragId;
    setDragId(null);
    setOverId(null);
    if (!id) return;
    const from = items.findIndex((it) => it.id === id);
    if (from === -1 || from === targetIndex) return;
    try {
      await tripsApi.updateItem(tripId, id, { position: targetIndex }, token);
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erreur');
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t(SLOT_I18N_KEY[slot])}
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setPicking((v) => !v)}
          className="gap-1"
        >
          {picking ? <X className="size-3" /> : <Plus className="size-3" />}
          {t('planning.add_place')}
        </Button>
      </div>

      {items.length === 0 && !picking && (
        <p className="py-1 text-sm text-muted-foreground">{t('planning.empty_slot')}</p>
      )}

      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <ItemRow
            key={item.id}
            tripId={tripId}
            token={token}
            item={item}
            isFirst={i === 0}
            isLast={i === items.length - 1}
            index={i}
            hasConflict={conflicts.has(item.id)}
            dragging={dragId === item.id}
            dragOver={overId === item.id && dragId !== null && dragId !== item.id}
            onDragStart={() => setDragId(item.id)}
            onDragEnter={() => dragId && setOverId(item.id)}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            onDrop={() => drop(i)}
            onChanged={onChanged}
            t={t}
          />
        ))}
      </ul>

      {picking && (
        <PlacePicker
          token={token}
          onPick={async (placeId) => {
            try {
              await tripsApi.addItem(tripId, { placeId, date, slot }, token);
              setPicking(false);
              onChanged();
            } catch (err) {
              toast.error(err instanceof ApiError ? err.message : 'Erreur');
            }
          }}
          t={t}
        />
      )}
    </div>
  );
}

function ItemRow({
  tripId,
  token,
  item,
  isFirst,
  isLast,
  index,
  hasConflict,
  dragging,
  dragOver,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
  onChanged,
  t,
}: {
  tripId: string;
  token: string;
  item: TripItem;
  isFirst: boolean;
  isLast: boolean;
  index: number;
  hasConflict: boolean;
  dragging: boolean;
  dragOver: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onChanged: () => void;
  t: T;
}) {
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`flex items-center gap-2 rounded-lg bg-background px-2.5 py-1.5 text-sm transition-opacity ${
        dragging ? 'opacity-40' : ''
      } ${dragOver ? 'ring-2 ring-primary' : ''} ${
        hasConflict ? 'ring-1 ring-amber-500/60' : ''
      }`}
    >
      <span
        className="shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-hidden
      >
        <GripVertical className="size-3.5" />
      </span>

      <div className="flex flex-col">
        <button
          type="button"
          disabled={isFirst || busy}
          onClick={() =>
            run(() =>
              tripsApi.updateItem(tripId, item.id, { position: index - 1 }, token),
            )
          }
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label={t('planning.move_up')}
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={isLast || busy}
          onClick={() =>
            run(() =>
              tripsApi.updateItem(tripId, item.id, { position: index + 1 }, token),
            )
          }
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label={t('planning.move_down')}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <Link href={`/lieux/${item.place.slug}`} className="font-medium hover:underline">
          {item.place.name}
        </Link>
        {item.time && <span className="ml-2 text-xs text-muted-foreground">{item.time}</span>}
        {hasConflict && (
          <span
            className="ml-2 inline-flex items-center gap-1 align-middle text-xs text-amber-700 dark:text-amber-400"
            title={t('planning.time_conflict')}
          >
            <AlertTriangle className="size-3" />
            {t('planning.time_conflict')}
          </span>
        )}
        {item.note && (
          <p className="truncate text-xs text-muted-foreground">{item.note}</p>
        )}
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => run(() => tripsApi.removeItem(tripId, item.id, token))}
        className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
        aria-label={t('planning.remove')}
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}

function PlacePicker({
  token,
  onPick,
  t,
}: {
  token: string;
  onPick: (placeId: string) => void;
  t: T;
}) {
  const [q, setQ] = useState('');

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list(token),
  });

  const { data: search } = useQuery({
    queryKey: ['place-search', q],
    queryFn: () => placesApi.list({ search: q, limit: 8, published: true }),
    enabled: q.trim().length >= 2,
  });

  const list = q.trim().length >= 2 ? (search?.data ?? []) : (favorites ?? []);

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border p-2">
      <div className="flex items-center gap-2 rounded-md border border-input px-2">
        <Search className="size-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('planning.search_places')}
          className="h-8 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {q.trim().length < 2 && (
        <p className="px-1 text-xs text-muted-foreground">
          {t('planning.pick_from_favorites')}
        </p>
      )}
      <ul className="max-h-56 space-y-0.5 overflow-y-auto">
        {list.map((place) => (
          <li key={place.id}>
            <button
              type="button"
              onClick={() => onPick(place.id)}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
            >
              <span className="font-medium">{place.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{place.address}</span>
            </button>
          </li>
        ))}
        {list.length === 0 && (
          <li className="px-2 py-1.5 text-xs text-muted-foreground">—</li>
        )}
      </ul>
    </div>
  );
}
