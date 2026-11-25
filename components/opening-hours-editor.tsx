'use client';

import { useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { dayLabel } from '@/lib/opening-hours';
import type {
  OpeningHours,
  OpeningHoursException,
  TimeSlot,
  WeekDay,
} from '@/lib/types';
import { WEEK_DAYS } from '@/lib/types';

interface Props {
  value: OpeningHours | null;
  onChange: (value: OpeningHours | null) => void;
}

const SLOT_INPUT =
  'h-8 rounded-md border border-input bg-transparent px-2 text-sm';

function SlotInputs({
  slots,
  onChange,
  max = 3,
}: {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  max?: number;
}) {
  return (
    <>
      {slots.map((slot, i) => (
        <span key={i} className="flex items-center gap-1">
          <input
            type="time"
            value={slot.open}
            onChange={(e) =>
              onChange(
                slots.map((s, j) => (j === i ? { ...s, open: e.target.value } : s)),
              )
            }
            className={SLOT_INPUT}
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="time"
            value={slot.close}
            onChange={(e) =>
              onChange(
                slots.map((s, j) => (j === i ? { ...s, close: e.target.value } : s)),
              )
            }
            className={SLOT_INPUT}
          />
          <button
            type="button"
            onClick={() => onChange(slots.filter((_, j) => j !== i))}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
            aria-label="Retirer le créneau"
          >
            <Trash2 className="size-3.5" />
          </button>
        </span>
      ))}
      {slots.length < max && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => onChange([...slots, { open: '09:00', close: '18:00' }])}
        >
          <Plus className="size-3" />
          Créneau
        </Button>
      )}
    </>
  );
}

/** Éditeur d'horaires : grille hebdomadaire + fermetures/ouvertures exceptionnelles. */
export function OpeningHoursEditor({ value, onChange }: Props) {
  const oh = value ?? {};
  const exceptions = oh.exceptions ?? [];

  const commit = useCallback(
    (next: OpeningHours) => {
      const hasWeek = WEEK_DAYS.some((d) => (next[d]?.length ?? 0) > 0);
      const hasExceptions = (next.exceptions?.length ?? 0) > 0;
      onChange(hasWeek || hasExceptions ? next : null);
    },
    [onChange],
  );

  function setDay(day: WeekDay, slots: TimeSlot[]) {
    const next: OpeningHours = { ...oh, [day]: slots };
    if (slots.length === 0) delete next[day];
    commit(next);
  }

  function setExceptions(list: OpeningHoursException[]) {
    const next: OpeningHours = { ...oh };
    if (list.length === 0) delete next.exceptions;
    else next.exceptions = list;
    commit(next);
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-3">
      {/* Grille hebdomadaire */}
      <div className="space-y-2">
        {WEEK_DAYS.map((day) => {
          const slots = oh[day] ?? [];
          return (
            <div key={day} className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-sm font-medium">
                {dayLabel(day)}
              </span>
              {slots.length === 0 && (
                <span className="text-sm text-muted-foreground">Fermé</span>
              )}
              <SlotInputs slots={slots} onChange={(s) => setDay(day, s)} />
            </div>
          );
        })}
      </div>

      {/* Exceptions */}
      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-sm font-medium">Fermetures / ouvertures exceptionnelles</p>
        {exceptions.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucune. Ex. : jour férié, congés annuels.
          </p>
        )}
        {exceptions.map((exc, i) => {
          const patch = (p: Partial<OpeningHoursException>) =>
            setExceptions(exceptions.map((e, j) => (j === i ? { ...e, ...p } : e)));
          return (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={exc.date}
                onChange={(e) => patch({ date: e.target.value })}
                className={SLOT_INPUT}
              />
              <label className="flex items-center gap-1.5 text-sm">
                <Checkbox
                  checked={exc.closed}
                  onCheckedChange={(v) =>
                    patch({ closed: v === true, slots: v === true ? undefined : (exc.slots ?? []) })
                  }
                />
                Fermé
              </label>
              {!exc.closed && (
                <SlotInputs
                  slots={exc.slots ?? []}
                  onChange={(s) => patch({ slots: s })}
                  max={2}
                />
              )}
              <button
                type="button"
                onClick={() => setExceptions(exceptions.filter((_, j) => j !== i))}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
                aria-label="Retirer l'exception"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() =>
            setExceptions([
              ...exceptions,
              { date: new Date().toISOString().slice(0, 10), closed: true },
            ])
          }
        >
          <Plus className="size-3" />
          Exception
        </Button>
      </div>
    </div>
  );
}
