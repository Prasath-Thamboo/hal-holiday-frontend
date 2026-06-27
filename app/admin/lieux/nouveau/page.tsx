'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { placesApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { PlaceForm } from '@/components/place-form';
import type { PlaceFormValues } from '@/components/place-form';
import { Button } from '@/components/ui/button';

export default function NouveauLieuPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: PlaceFormValues) {
    setLoading(true);
    try {
      await placesApi.create(values, accessToken!);
      toast.success('Lieu créé avec succès.');
      router.push('/admin/lieux');
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : 'Erreur lors de la création.';
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
        <h2 className="font-semibold">Nouveau lieu</h2>
      </div>
      <PlaceForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Créer le lieu"
      />
    </>
  );
}
