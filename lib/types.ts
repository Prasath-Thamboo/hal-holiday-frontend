export type PlaceType = 'restaurant' | 'mosque' | 'activity';

/** Sous-catégorie d'un lieu `activity`. `null` pour les autres types. */
export type PlaceCategory = 'touristique' | 'divertissement';

export type UserRole = 'admin' | 'user';

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const WEEK_DAYS: readonly WeekDay[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

export interface TimeSlot {
  open: string;
  close: string;
}

export interface OpeningHoursException {
  date: string;
  closed: boolean;
  slots?: TimeSlot[];
}

export type OpeningHours = Partial<Record<WeekDay, TimeSlot[]>> & {
  exceptions?: OpeningHoursException[];
};

export interface Place {
  id: string;
  type: PlaceType;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  arrondissement: number;
  city: string;
  category: PlaceCategory | null;
  opening_hours: OpeningHours | null;
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

export interface NotificationPreferences {
  promos: boolean;
  planning_reminders: boolean;
  prayer_times: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  phoneNumber: string | null;
  language: string;
  halalStrictnessPreference: number | null;
  notificationPreferences: NotificationPreferences;
  acceptedTermsAt: string | null;
  acceptedPrivacyPolicyAt: string | null;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface UpdatePreferencesPayload {
  language?: string;
  halalStrictnessPreference?: number;
  notificationPreferences?: Partial<NotificationPreferences>;
}

// ── Planning (Phase 2) ────────────────────────────────────────────────────

export type TripSlot = 'matin' | 'midi' | 'apres_midi' | 'soir';

export const TRIP_SLOTS: readonly TripSlot[] = ['matin', 'midi', 'apres_midi', 'soir'];

export interface Trip {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripSummary extends Trip {
  dayCount: number;
  itemCount: number;
}

export interface TripItemPlace {
  id: string;
  name: string;
  slug: string;
  type: PlaceType;
  address: string;
  category: PlaceCategory | null;
  latitude: number;
  longitude: number;
}

export interface TripItem {
  id: string;
  tripId: string;
  date: string;
  slot: TripSlot;
  time: string | null;
  position: number;
  note: string | null;
  place: TripItemPlace;
}

export interface TripDay {
  date: string;
  items: TripItem[];
}

export interface TripDetail {
  trip: Trip;
  days: TripDay[];
}

export interface CreateTripPayload {
  title: string;
  startDate: string;
  endDate: string;
}

export interface CreateTripItemPayload {
  placeId: string;
  date: string;
  slot: TripSlot;
  time?: string;
  note?: string;
}

export interface UpdateTripItemPayload {
  date?: string;
  slot?: TripSlot;
  time?: string;
  note?: string;
  position?: number;
}

// ── Promotions (Phase 3) ──────────────────────────────────────────────────

export interface PromotionPlaceInfo {
  id: string;
  name: string;
  slug: string;
  type: PlaceType;
  arrondissement: number;
  address: string;
}

export interface Promotion {
  id: string;
  placeId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  code: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  place: PromotionPlaceInfo;
}

export interface PaginatedPromotions {
  data: Promotion[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreatePromotionPayload {
  placeId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  code?: string;
  active?: boolean;
}

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
  types?: PlaceType[];
  categories?: PlaceCategory[];
  minHalal?: number;
  noAlcohol?: boolean;
  search?: string;
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
  category?: PlaceCategory | null;
  opening_hours?: OpeningHours | null;
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
  isActive: boolean;
  created_at: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role?: UserRole;
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
