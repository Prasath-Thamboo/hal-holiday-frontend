'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { placesApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { PlaceForm } from '@/components/place-form';
import type { PlaceFormValues } from '@/components/place-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ModifierLieuPage({
  params,
}: {
  params: { id: string };
}) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: place, isLoading } = useQuery({
    queryKey: ['place', params.id],
    queryFn: () => placesApi.byId(params.id, accessToken!),
    enabled: !!accessToken,
  });

  async function handleSubmit(values: PlaceFormValues) {
    setLoading(true);
    try {
      await placesApi.update(params.id, values, accessToken!);
      void qc.invalidateQueries({ queryKey: ['admin-places'] });
      toast.success('Lieu mis à jour.');
      router.push('/admin/lieux');
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Erreur lors de la mise à jour.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/lieux">
          <Button variant="ghost" size="icon-sm">
            <ChevronLeft />
          </Button>
        </Link>
        <h2 className="font-semibold">
          {place ? `Modifier — ${place.name}` : 'Modifier un lieu'}
        </h2>
      </div>

      {isLoading && <Skeleton className="h-96 rounded-xl" />}
      {place && (
        <PlaceForm
          defaultValues={place}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Mettre à jour"
        />
      )}
    </>
  );
}
