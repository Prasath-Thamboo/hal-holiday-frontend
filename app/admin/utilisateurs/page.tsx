'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUtilisateursPage() {
  const { accessToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.list(accessToken!),
    enabled: !!accessToken,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Comptes ({data?.length ?? '…'})</h2>
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
                <th className="px-4 py-2.5 text-left font-medium">Inscrit le</th>
                <th className="px-4 py-2.5 text-left font-medium text-xs font-mono">ID</th>
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
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {user.id}
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
