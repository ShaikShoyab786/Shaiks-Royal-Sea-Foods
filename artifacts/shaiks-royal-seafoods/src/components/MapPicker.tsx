import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

// Gold pin icon — avoids the Vite/leaflet image import issue
const goldIcon = L.divIcon({
  html: `<div style="width:22px;height:22px;background:#D4AF37;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.5);"></div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function DraggableMarker({ lat, lng, onChange }: Props) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      draggable
      position={[lat, lng]}
      icon={goldIcon}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const m = markerRef.current;
          if (m) {
            const pos = m.getLatLng();
            onChange(pos.lat, pos.lng);
          }
        },
      }}
    />
  );
}

export function MapPicker({ lat, lng, onChange }: Props) {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search + ' Vijayawada')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat: newLat, lon: newLng } = data[0];
        const parsedLat = parseFloat(newLat);
        const parsedLng = parseFloat(newLng);
        onChange(parsedLat, parsedLng);
        mapRef.current?.flyTo([parsedLat, parsedLng], 16, { duration: 1 });
      }
    } catch {
      // silent fallback
    } finally {
      setSearching(false);
    }
  };

  // Pan map when coordinates change externally (e.g. GPS)
  useEffect(() => {
    mapRef.current?.panTo([lat, lng]);
  }, [lat, lng]);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search area, street or landmark…"
            className="pl-9 bg-background/50"
          />
        </div>
        <Button type="submit" variant="outline" size="icon" className="border-primary/40 text-primary hover:bg-primary/10 shrink-0" disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border/50 h-56">
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef as any}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <DraggableMarker lat={lat} lng={lng} onChange={onChange} />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Drag the <span className="text-primary font-medium">gold pin</span> or click the map to set your exact delivery location.
      </p>
    </div>
  );
}
