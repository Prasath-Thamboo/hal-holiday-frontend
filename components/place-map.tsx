'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { LocateFixed } from 'lucide-react';
import type { NearbyPlace, Place, PlaceCategory, PlaceType } from '@/lib/types';
import { todaySummary } from '@/lib/opening-hours';

import 'leaflet/dist/leaflet.css';

// ── Marqueurs différenciés par type / sous-catégorie ─────────────────────────

type MarkerKind = PlaceType | PlaceCategory;

const MARKER_STYLE: Record<MarkerKind, { emoji: string; bg: string }> = {
  mosque: { emoji: '🕌', bg: '#1f7a5a' },
  restaurant: { emoji: '🍽️', bg: '#c4623d' },
  activity: { emoji: '✨', bg: '#c99a2e' },
  touristique: { emoji: '🏛️', bg: '#2e6fc9' },
  divertissement: { emoji: '🎭', bg: '#8b5cf6' },
};

function markerKind(place: Pick<Place, 'type' | 'category'>): MarkerKind {
  if (place.type === 'activity' && place.category) return place.category;
  return place.type;
}

const iconCache = new Map<string, L.DivIcon>();

function placeIcon(place: Pick<Place, 'type' | 'category'>, active: boolean): L.DivIcon {
  const kind = markerKind(place);
  const key = `${kind}-${active ? 'a' : ''}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const { emoji, bg } = MARKER_STYLE[kind];
  const size = active ? 40 : 32;
  const icon = L.divIcon({
    className: 'hh-marker',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
      background:${bg};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      border:2px solid #fff;${active ? 'outline:3px solid rgba(31,122,90,.35);' : ''}">
      <span style="transform:rotate(45deg);font-size:${active ? 18 : 15}px;line-height:1">${emoji}</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
  iconCache.set(key, icon);
  return icon;
}

const userIcon = L.divIcon({
  className: 'hh-user-marker',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#2563eb;border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(37,99,235,.25)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ── Contrôleur : recentre quand la position de l'utilisateur change ──────────

function RecenterOnUser({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom() < 13 ? 14 : map.getZoom());
  }, [coords, map]);
  return null;
}

interface PlaceMapProps {
  places: NearbyPlace[];
  userCoords: { lat: number; lng: number };
  selectedId?: string | null;
  onSelect?: (place: NearbyPlace) => void;
  className?: string;
}

export function PlaceMap({
  places,
  userCoords,
  selectedId,
  onSelect,
  className,
}: PlaceMapProps) {
  const center = useMemo<[number, number]>(
    () => [userCoords.lat, userCoords.lng],
    [userCoords.lat, userCoords.lng],
  );

  return (
    <MapContainer
      center={center}
      zoom={14}
      className={className ?? 'h-[70vh] w-full rounded-xl border border-border'}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterOnUser coords={center} />

      <Marker position={center} icon={userIcon}>
        <Popup>Votre position</Popup>
      </Marker>

      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={placeIcon(place, place.id === selectedId)}
          eventHandlers={{ click: () => onSelect?.(place) }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{place.name}</p>
              <p className="text-muted-foreground">{place.address}</p>
              {place.opening_hours && (
                <p className="mt-1 text-xs">{todaySummary(place.opening_hours)}</p>
              )}
              <Link href={`/lieux/${place.slug}`} className="text-primary underline">
                Voir le détail
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
