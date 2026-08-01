export type PlaceType = 'restaurant' | 'mosque' | 'activity';

export type UserRole = 'admin' | 'user';

export interface Place {
  id: string;
  type: PlaceType;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  arrondissement: number;
  city: string;
  halal_level: number | null;
  serves_alcohol: boolean;
  prayer_room: boolean;
  published: boolean;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

export interface NearbyPlace extends Place {
  latitude: number;
  longitude: number;
  distance_m: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
  types?: PlaceType[];
  minHalal?: number;
  noAlcohol?: boolean;
}

export interface CreatePlacePayload {
  type: PlaceType;
  name: string;
  slug: string;
  description?: string;
  address: string;
  arrondissement: number;
  city?: string;
  latitude: number;
  longitude: number;
  halal_level?: number;
  serves_alcohol?: boolean;
  prayer_room?: boolean;
  published?: boolean;
}

export interface PlaceStats {
  total: number;
  published: number;
  drafts: number;
  byType: { restaurant: number; mosque: number; activity: number };
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
