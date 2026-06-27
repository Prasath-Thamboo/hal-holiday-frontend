'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { placesApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLieuxPage() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-places'],
    queryFn: () => placesApi.list({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => placesApi.remove(id, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-places'] });
      toast.success('Lieu supprimé.');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Erreur lors de la suppression.';
      toast.error(msg);
    },
  });

  function confirmDelete(id: string, name: string) {
    if (window.confirm(`Supprimer « ${name} » ? Cette action est irréversible.`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Lieux ({data?.meta.total ?? '…'})</h2>
        <Link href="/admin/lieux/nouveau">
          <Button size="sm">
            <Plus />
            Nouveau lieu
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      )}

      {data && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Nom</th>
                <th className="px-4 py-2.5 text-left font-medium">Type</th>
                <th className="px-4 py-2.5 text-left font-medium">Publié</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.data.map((place) => (
                <tr key={place.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{place.name}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary">{place.type}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    {place.published ? (
                      <Badge>Publié</Badge>
                    ) : (
                      <Badge variant="outline">Brouillon</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/lieux/${place.id}/modifier`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmDelete(place.id, place.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
