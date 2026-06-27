import type {
  AuthTokens,
  AuthUser,
  CreatePlacePayload,
  NearbyPlace,
  NearbyQuery,
  PaginatedResult,
  Place,
} from './types';
import { ApiError } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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
  list: (params?: { page?: number; limit?: number }) =>
    request<PaginatedResult<Place>>(`/places?${buildQuery(params ?? {})}`),

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
