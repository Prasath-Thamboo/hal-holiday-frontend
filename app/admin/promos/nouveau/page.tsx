'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { promotionsApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { PromotionForm, type PromotionFormValues } from '@/components/promotion-form';
import { Button } from '@/components/ui/button';

export default function NouvellePromoPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: PromotionFormValues) {
    setLoading(true);
    try {
      await promotionsApi.create(values, accessToken!);
      toast.success('Promotion créée.');
      router.push('/admin/promos');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la création.');
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
        <h2 className="font-semibold">Nouvelle promotion</h2>
      </div>
      <PromotionForm onSubmit={handleSubmit} loading={loading} submitLabel="Créer la promotion" />
    </>
  );
}
