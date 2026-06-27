'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreatePlacePayload, Place } from '@/lib/types';

export interface PlaceFormValues extends CreatePlacePayload {}

interface PlaceFormProps {
  defaultValues?: Partial<Place>;
  onSubmit: (values: PlaceFormValues) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

function Field({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PlaceForm({
  defaultValues: d,
  onSubmit,
  loading,
  submitLabel = 'Enregistrer',
}: PlaceFormProps) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string) ?? '';

    const values: PlaceFormValues = {
      type: get('type') as PlaceFormValues['type'],
      name: get('name'),
      slug: get('slug'),
      description: get('description') || undefined,
      address: get('address'),
      arrondissement: parseInt(get('arrondissement'), 10),
      city: get('city') || 'Paris',
      latitude: parseFloat(get('latitude')),
      longitude: parseFloat(get('longitude')),
      halal_level: get('halal_level') ? parseInt(get('halal_level'), 10) : undefined,
      serves_alcohol: get('serves_alcohol') === 'true',
      prayer_room: get('prayer_room') === 'true',
      published: get('published') === 'true',
    };
    await onSubmit(values);
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-5 rounded-xl border border-border p-6"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Type */}
        <Field id="type" label="Type *">
          <select
            id="type"
            name="type"
            required
            defaultValue={d?.type ?? 'restaurant'}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="restaurant">Restaurant</option>
            <option value="mosque">Mosquée</option>
            <option value="activity">Activité</option>
          </select>
        </Field>

        {/* Halal level */}
        <Field id="halal_level" label="Niveau halal">
          <select
            id="halal_level"
            name="halal_level"
            defaultValue={d?.halal_level ?? ''}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Non renseigné</option>
            <option value="1">1 — Déclaratif</option>
            <option value="2">2 — Validé mosquée</option>
            <option value="3">3 — Certifié organisme</option>
            <option value="4">4 — 100% Halal</option>
          </select>
        </Field>

        {/* Name */}
        <Field id="name" label="Nom *" hint="Max 255 caractères">
          <Input
            id="name"
            name="name"
            required
            maxLength={255}
            defaultValue={d?.name}
          />
        </Field>

        {/* Slug */}
        <Field id="slug" label="Slug *" hint="Uniquement lettres minuscules, chiffres, tirets">
          <Input
            id="slug"
            name="slug"
            required
            maxLength={255}
            pattern="[a-z0-9-]+"
            defaultValue={d?.slug}
          />
        </Field>

        {/* Address */}
        <Field id="address" label="Adresse *" hint="Max 500 caractères">
          <Input
            id="address"
            name="address"
            required
            maxLength={500}
            defaultValue={d?.address}
            className="sm:col-span-2"
          />
        </Field>

        {/* Arrondissement */}
        <Field id="arrondissement" label="Arrondissement *" hint="1 à 20">
          <Input
            id="arrondissement"
            name="arrondissement"
            type="number"
            required
            min={1}
            max={20}
            defaultValue={d?.arrondissement}
          />
        </Field>

        {/* City */}
        <Field id="city" label="Ville">
          <Input
            id="city"
            name="city"
            maxLength={100}
            defaultValue={d?.city ?? 'Paris'}
          />
        </Field>

        {/* Latitude */}
        <Field id="latitude" label="Latitude *" hint="ex : 48.8566">
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            required
            min={-90}
            max={90}
            defaultValue={d ? undefined : undefined}
          />
        </Field>

        {/* Longitude */}
        <Field id="longitude" label="Longitude *" hint="ex : 2.3522">
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            required
            min={-180}
            max={180}
            defaultValue={d ? undefined : undefined}
          />
        </Field>
      </div>

      {/* Description */}
      <Field id="description" label="Description">
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={d?.description ?? ''}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
        />
      </Field>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6 text-sm">
        {(
          [
            { name: 'serves_alcohol', label: "Sert de l'alcool" },
            { name: 'prayer_room', label: 'Salle de prière' },
            { name: 'published', label: 'Publié' },
          ] as const
        ).map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              value="true"
              defaultChecked={!!d?.[name]}
              className="rounded border-input"
            />
            {label}
          </label>
        ))}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Enregistrement…' : submitLabel}
      </Button>
    </form>
  );
}
