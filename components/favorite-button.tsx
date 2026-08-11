'use client';

import { Heart } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { favoritesApi } from '@/lib/api';

export function FavoriteButton({
  placeId,
  className,
}: {
  placeId: string;
  className?: string;
}) {
  const { user, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteIds } = useQuery({
    queryKey: ['favorite-ids'],
    queryFn: () => favoritesApi.ids(accessToken!),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const isFavorite = favoriteIds?.includes(placeId) ?? false;

  const mutation = useMutation({
    mutationFn: () =>
      isFavorite
        ? favoritesApi.remove(placeId, accessToken!)
        : favoritesApi.add(placeId, accessToken!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorite-ids'] });
      const previous = queryClient.getQueryData<string[]>(['favorite-ids']);
      queryClient.setQueryData<string[]>(['favorite-ids'], (prev = []) =>
        isFavorite ? prev.filter((id) => id !== placeId) : [...prev, placeId],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['favorite-ids'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (!user) return null;

  return (
    <button
      type="button"
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      className={
        className ??
        'flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background disabled:opacity-60'
      }
    >
      <Heart
        className={isFavorite ? 'size-4 fill-terracotta text-terracotta' : 'size-4 text-muted-foreground'}
        strokeWidth={2}
      />
    </button>
  );
}
