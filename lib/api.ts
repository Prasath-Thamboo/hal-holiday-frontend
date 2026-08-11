import type {
  AdminUser,
  AuthTokens,
  AuthUser,
  CreatePlacePayload,
  CreateUserPayload,
  NearbyPlace,
  NearbyQuery,
  PaginatedResult,
  Place,
  PlaceStats,
  PlaceType,
  UserRole,
} from './types';
import { ApiError } from './types';

// Server Components run in Node and `fetch` there can't resolve a relative
// URL, so hit the backend directly; the browser still goes through the
// same-origin `/api` rewrite proxy (see next.config.ts).
const BASE =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000')
    : '/api';

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = init;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...rest, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string | string[] };
    const msg = Array.isArray(body.message)
      ? body.message.join(', ')
      : (body.message ?? res.statusText);
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((item) => q.append(k, String(item)));
    else q.set(k, String(v));
  }
  return q.toString();
}

// ── Places ────────────────────────────────────────────────────────────────────

export const placesApi = {
  list: (params?: { page?: number; limit?: number; published?: boolean; types?: PlaceType[] }) =>
    request<PaginatedResult<Place>>(`/places?${buildQuery(params ?? {})}`),

  stats: (token: string) =>
    request<PlaceStats>('/places/stats', { token }),

  nearby: (query: NearbyQuery) =>
    request<NearbyPlace[]>(`/places/nearby?${buildQuery(query as unknown as Record<string, unknown>)}`),

  bySlug: (slug: string) =>
    request<Place>(`/places/slug/${encodeURIComponent(slug)}`),

  byId: (id: string, token: string) =>
    request<Place>(`/places/${id}`, { token }),

  create: (data: CreatePlacePayload, token: string) =>
    request<Place>('/places', { method: 'POST', body: JSON.stringify(data), token }),

  update: (id: string, data: Partial<CreatePlacePayload>, token: string) =>
    request<Place>(`/places/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  remove: (id: string, token: string) =>
    request<void>(`/places/${id}`, { method: 'DELETE', token }),
};

// ── Favorites ─────────────────────────────────────────────────────────────────

export const favoritesApi = {
  list: (token: string) => request<Place[]>('/favorites', { token }),

  ids: (token: string) => request<string[]>('/favorites/ids', { token }),

  add: (placeId: string, token: string) =>
    request<void>(`/favorites/${placeId}`, { method: 'POST', token }),

  remove: (placeId: string, token: string) =>
    request<void>(`/favorites/${placeId}`, { method: 'DELETE', token }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (token: string) =>
    request<AdminUser[]>('/users', { token }),

  create: (data: CreateUserPayload, token: string) =>
    request<AdminUser>('/users', { method: 'POST', body: JSON.stringify(data), token }),

  updateRole: (id: string, role: UserRole, token: string) =>
    request<AdminUser>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
      token,
    }),

  setActive: (id: string, isActive: boolean, token: string) =>
    request<AdminUser>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
      token,
    }),
};

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string) =>
    request<AuthTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refresh_token: string) =>
    request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),

  logout: (refresh_token: string) =>
    request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),

  me: (token: string) => request<AuthUser>('/auth/me', { token }),
};
