'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { placesApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function AdminLieuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { accessToken } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: place, isLoading } = useQuery({
    queryKey: ['place', id],
    queryFn: () => placesApi.byId(id, accessToken!),
    enabled: !!accessToken,
  });

  const deleteMutation = useMutation({
    mutationFn: () => placesApi.remove(id, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-places'] });
      toast.success('Lieu supprimé.');
      router.push('/admin/lieux');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Erreur lors de la suppression.';
      toast.error(msg);
    },
  });

  function confirmDelete() {
    if (place && window.confirm(`Supprimer « ${place.name} » ? Cette action est irréversible.`)) {
      deleteMutation.mutate();
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </>
    );
  }

  if (!place) return null;

  const createdAt = new Date(place.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/lieux">
            <Button variant="ghost" size="icon-sm">
              <ChevronLeft />
            </Button>
          </Link>
          <h2 className="font-semibold">{place.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/lieux/${id}/modifier`}>
            <Button variant="outline" size="sm">
              <Pencil />
              Modifier
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {place.published ? (
          <Badge>Publié</Badge>
        ) : (
          <Badge variant="outline">Brouillon</Badge>
        )}
        <Badge variant="secondary">{TYPE_LABELS[place.type] ?? place.type}</Badge>
        {place.halal_level != null && (
          <Badge>{HALAL_LABELS[place.halal_level]}</Badge>
        )}
        {place.prayer_room && <Badge variant="outline">Salle de prière</Badge>}
        {place.serves_alcohol && (
          <Badge variant="destructive">Sert de l&apos;alcool</Badge>
        )}
      </div>

      <Separator className="my-5" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 text-sm">
        <Field label="Adresse" value={place.address} />
        <Field label="Arrondissement" value={`${place.arrondissement}e`} />
        <Field label="Ville" value={place.city} />
        <Field label="Slug" value={place.slug} mono />
        <Field label="Créé le" value={createdAt} />
        <Field label="ID" value={place.id} mono />
        {place.latitude != null && place.longitude != null && (
          <Field
            label="Coordonnées"
            value={`${place.latitude.toFixed(6)}, ${place.longitude.toFixed(6)}`}
            mono
          />
        )}
      </div>

      {place.description && (
        <>
          <Separator className="my-5" />
          <div>
            <p className="mb-1.5 text-sm font-medium">Description</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {place.description}
            </p>
          </div>
        </>
      )}
    </>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="font-medium">{label}</p>
      <p className={`mt-0.5 text-muted-foreground${mono ? ' font-mono text-xs' : ''}`}>
        {value}
      </p>
    </div>
  );
}
