'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { placesApi } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const STAT_CARDS = [
  { key: 'total' as const, label: 'Total lieux' },
  { key: 'published' as const, label: 'Publiés' },
  { key: 'drafts' as const, label: 'Brouillons' },
];

const TYPE_CARDS = [
  { key: 'restaurant' as const, label: 'Restaurants' },
  { key: 'mosque' as const, label: 'Mosquées' },
  { key: 'activity' as const, label: 'Activités' },
];

export default function AdminDashboardPage() {
  const { accessToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => placesApi.stats(accessToken!),
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  return (
    <>
      <h2 className="mb-6 font-semibold">Tableau de bord</h2>

      <div className="space-y-6">
        {/* Statuts */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Vue globale
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STAT_CARDS.map(({ key, label }) =>
              isLoading ? (
                <Skeleton key={key} className="h-24 rounded-xl" />
              ) : (
                <Card key={key}>
                  <CardHeader className="pb-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{data?.[key] ?? '—'}</p>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>

        {/* Par type */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Par type
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TYPE_CARDS.map(({ key, label }) =>
              isLoading ? (
                <Skeleton key={key} className="h-24 rounded-xl" />
              ) : (
                <Card key={key}>
                  <CardHeader className="pb-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{data?.byType[key] ?? '—'}</p>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
}
