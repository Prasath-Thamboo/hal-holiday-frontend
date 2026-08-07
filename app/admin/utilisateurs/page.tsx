'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import type { AdminUser, UserRole } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUtilisateursPage() {
  const { user: currentUser, accessToken } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.list(accessToken!),
    enabled: !!accessToken,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Rôle mis à jour.');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour.';
      toast.error(msg);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.setActive(id, isActive, accessToken!),
    onSuccess: (_data, { isActive }) => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(isActive ? 'Compte réactivé.' : 'Compte désactivé.');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour.';
      toast.error(msg);
    },
  });

  function isSelf(u: AdminUser) {
    return u.id === currentUser?.id;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Comptes ({data?.length ?? '…'})</h2>
        <Link href="/admin/utilisateurs/nouveau">
          <Button size="sm">
            <Plus />
            Nouveau compte
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
                <th className="px-4 py-2.5 text-left font-medium">Email</th>
                <th className="px-4 py-2.5 text-left font-medium">Rôle</th>
                <th className="px-4 py-2.5 text-left font-medium">Statut</th>
                <th className="px-4 py-2.5 text-left font-medium">Inscrit le</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{user.email}</td>
                  <td className="px-4 py-2.5">
                    {user.role === 'admin' ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Utilisateur</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {user.isActive ? (
                      <Badge variant="outline">Actif</Badge>
                    ) : (
                      <Badge variant="destructive">Désactivé</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={user.role}
                        disabled={isSelf(user) || roleMutation.isPending}
                        onChange={(e) =>
                          roleMutation.mutate({
                            id: user.id,
                            role: e.target.value as UserRole,
                          })
                        }
                        className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button
                        variant={user.isActive ? 'destructive' : 'outline'}
                        size="sm"
                        disabled={isSelf(user) || statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({ id: user.id, isActive: !user.isActive })
                        }
                      >
                        {user.isActive ? 'Désactiver' : 'Réactiver'}
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
