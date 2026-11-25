'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { placesApi } from '@/lib/api';
import type { CreatePromotionPayload, Promotion } from '@/lib/types';

export type PromotionFormValues = CreatePromotionPayload;

interface Props {
  defaultValues?: Partial<Promotion>;
  onSubmit: (values: PromotionFormValues) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PromotionForm({
  defaultValues: d,
  onSubmit,
  loading,
  submitLabel = 'Enregistrer',
}: Props) {
  const { data: places } = useQuery({
    queryKey: ['admin-places-min'],
    queryFn: () => placesApi.list({ limit: 100 }),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? '').trim();

    await onSubmit({
      placeId: get('placeId'),
      title: get('title'),
      description: get('description') || undefined,
      imageUrl: get('imageUrl') || undefined,
      startDate: get('startDate'),
      endDate: get('endDate'),
      code: get('code') || undefined,
      active: fd.get('active') === 'true',
    });
  }

  const selectCls =
    'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-5 rounded-xl border border-border p-6"
    >
      <Field id="placeId" label="Lieu partenaire *">
        <select
          id="placeId"
          name="placeId"
          required
          defaultValue={d?.placeId ?? ''}
          className={selectCls}
        >
          <option value="" disabled>
            — Choisir un lieu —
          </option>
          {places?.data.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.arrondissement}e)
            </option>
          ))}
        </select>
      </Field>

      <Field id="title" label="Titre *" hint="Max 120 caractères">
        <Input id="title" name="title" required maxLength={120} defaultValue={d?.title} />
      </Field>

      <Field id="description" label="Description">
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={d?.description ?? ''}
          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <Field
        id="imageUrl"
        label="URL de l'image"
        hint="URL publique (https://…). Pas d'upload dans cette version."
      >
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          maxLength={1000}
          defaultValue={d?.imageUrl ?? ''}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field id="startDate" label="Début de validité *">
          <Input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={d?.startDate}
          />
        </Field>
        <Field id="endDate" label="Fin de validité *">
          <Input id="endDate" name="endDate" type="date" required defaultValue={d?.endDate} />
        </Field>
      </div>

      <Field id="code" label="Code promo" hint="Optionnel">
        <Input id="code" name="code" maxLength={40} defaultValue={d?.code ?? ''} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          value="true"
          defaultChecked={d?.active ?? true}
          className="rounded border-input"
        />
        Active (visible dans la liste publique)
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? 'Enregistrement…' : submitLabel}
      </Button>
    </form>
  );
}
