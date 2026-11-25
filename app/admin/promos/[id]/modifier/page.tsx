'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { promotionsApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { PromotionForm, type PromotionFormValues } from '@/components/promotion-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ModifierPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { accessToken } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: promo, isLoading } = useQuery({
    queryKey: ['promotion', id],
    queryFn: () => promotionsApi.get(id),
  });

  async function handleSubmit(values: PromotionFormValues) {
    setLoading(true);
    try {
      await promotionsApi.update(id, values, accessToken!);
      void qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      void qc.invalidateQueries({ queryKey: ['promotion', id] });
      toast.success('Promotion mise à jour.');
      router.push('/admin/promos');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/promos">
          <Button variant="ghost" size="icon-sm">
            <ChevronLeft />
          </Button>
        </Link>
        <h2 className="font-semibold">
          {promo ? `Modifier — ${promo.title}` : 'Modifier une promotion'}
        </h2>
      </div>

      {isLoading && <Skeleton className="h-96 rounded-xl" />}
      {promo && (
        <PromotionForm
          defaultValues={promo}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Mettre à jour"
        />
      )}
    </>
  );
}
