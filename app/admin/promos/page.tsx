'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { promotionsApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

export default function AdminPromosPage() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () => promotionsApi.adminList(accessToken!, { limit: 100 }),
    enabled: !!accessToken,
  });

  const toggle = useMutation({
    mutationFn: (id: string) => promotionsApi.toggleActive(id, accessToken!),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => promotionsApi.remove(id, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      toast.success('Promotion supprimée.');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur'),
  });

  function confirmDelete(id: string, title: string) {
    if (window.confirm(`Supprimer « ${title} » ?`)) remove.mutate(id);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Promotions ({data?.meta.total ?? '…'})</h2>
        <Link href="/admin/promos/nouveau">
          <Button size="sm">
            <Plus />
            Nouvelle promo
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      )}

      {data && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Titre</th>
                <th className="px-4 py-2.5 text-left font-medium">Lieu</th>
                <th className="px-4 py-2.5 text-left font-medium">Validité</th>
                <th className="px-4 py-2.5 text-left font-medium">Active</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.data.map((promo) => (
                <tr key={promo.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{promo.title}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary">{promo.place.name}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {promo.startDate} → {promo.endDate}
                  </td>
                  <td className="px-4 py-2.5">
                    <Switch
                      checked={promo.active}
                      onCheckedChange={() => toggle.mutate(promo.id)}
                      disabled={toggle.isPending}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/promos/${promo.id}/modifier`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmDelete(promo.id, promo.title)}
                        disabled={remove.isPending}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    Aucune promotion.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
