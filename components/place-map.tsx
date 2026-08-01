'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import type { NearbyPlace } from '@/lib/types';

import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon broken by webpack asset hashing
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'hue-rotate-[200deg]',
});

function FlyToUser({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14);
  }, [coords, map]);
  return null;
}

interface PlaceMapProps {
  places: NearbyPlace[];
  userCoords: { lat: number; lng: number };
}

export function PlaceMap({ places, userCoords }: PlaceMapProps) {
  const center: [number, number] = [userCoords.lat, userCoords.lng];

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-[420px] w-full rounded-xl border border-border"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToUser coords={center} />

      {/* Position de l'utilisateur */}
      <Marker position={center} icon={userIcon}>
        <Popup>Votre position</Popup>
      </Marker>

      {/* Lieux proches */}
      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{place.name}</p>
              <p className="text-muted-foreground">{place.address}</p>
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
