"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLng } from "@/lib/data";

export interface MapMarker {
  id: string;
  position: LatLng;
  kind: "caregiver" | "home" | "sos" | "dot";
  photo?: string;
  label?: string;
  color?: string;
  onClick?: () => void;
}

export interface LiveMapProps {
  center: LatLng;
  zoom?: number;
  markers: MapMarker[];
  geofence?: { center: LatLng; radius: number; color?: string };
  route?: LatLng[];
  follow?: LatLng;
  className?: string;
  interactive?: boolean;
}

function iconFor(m: MapMarker) {
  if (m.kind === "home") {
    return L.divIcon({
      className: "mcn-marker",
      html: `<div class="mcn-home"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }
  if (m.kind === "dot") {
    return L.divIcon({
      className: "mcn-marker",
      html: `<div class="mcn-dot" style="background:${m.color ?? "#1e6fd9"}"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }
  const sos = m.kind === "sos" ? " sos" : "";
  const bg = m.photo ? `background-image:url('${m.photo}')` : "background:#1e6fd9";
  return L.divIcon({
    className: "mcn-marker",
    html: `<div class="mcn-pin${sos}" style="${bg};${m.color ? `border-color:${m.color}` : ""}"></div>`,
    iconSize: [44, 53],
    iconAnchor: [22, 53],
    tooltipAnchor: [0, -50],
  });
}

// Cache de íconos: evita recrear el DOM del marcador en cada tick de movimiento.
const iconCache = new Map<string, L.DivIcon>();
function cachedIcon(m: MapMarker) {
  const key = `${m.kind}|${m.photo ?? ""}|${m.color ?? ""}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = iconFor(m);
    iconCache.set(key, icon);
  }
  return icon;
}

function Follow({ to }: { to?: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (to) map.panTo(to, { animate: true, duration: 0.8 });
  }, [map, to]);
  return null;
}

function FixSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function LiveMap({ center, zoom = 15, markers, geofence, route, follow, className, interactive = true }: LiveMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      attributionControl={true}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FixSize />
      <Follow to={follow} />
      {geofence && (
        <Circle
          center={geofence.center}
          radius={geofence.radius}
          pathOptions={{ color: geofence.color ?? "#20b486", fillColor: geofence.color ?? "#20b486", fillOpacity: 0.12, weight: 2, dashArray: "6 6" }}
        />
      )}
      {route && <Polyline positions={route} pathOptions={{ color: "#1e6fd9", weight: 4, opacity: 0.55, dashArray: "2 8", lineCap: "round" }} />}
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={m.position}
          icon={cachedIcon(m)}
          eventHandlers={m.onClick ? { click: m.onClick } : undefined}
          zIndexOffset={m.kind === "sos" ? 1000 : m.kind === "caregiver" ? 500 : 0}
        >
          {m.label && (
            <Tooltip direction="top" opacity={0.95}>
              <span className="text-xs font-semibold">{m.label}</span>
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
