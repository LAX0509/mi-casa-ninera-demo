import type { LatLng } from "./data";

/** Distancia en metros entre dos coordenadas. */
export function distanceMeters(a: LatLng, b: LatLng) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Interpola una posición a lo largo de una polilínea, t en [0,1]. */
export function along(path: LatLng[], t: number): LatLng {
  if (path.length === 1) return path[0];
  const clamped = Math.max(0, Math.min(1, t));
  const segs = path.slice(1).map((p, i) => distanceMeters(path[i], p));
  const total = segs.reduce((a, b) => a + b, 0) || 1;
  let target = clamped * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const f = segs[i] === 0 ? 0 : Math.min(1, target / segs[i]);
      const a = path[i];
      const b = path[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    target -= segs[i];
  }
  return path[path.length - 1];
}

/** Ruta "por calles" simulada entre dos puntos (zig-zag suave). */
export function routeBetween(from: LatLng, to: LatLng): LatLng[] {
  const pts: LatLng[] = [from];
  const steps = 5;
  for (let i = 1; i < steps; i++) {
    const f = i / steps;
    const lat = from[0] + (to[0] - from[0]) * f;
    const lng = from[1] + (to[1] - from[1]) * f;
    // alterna desplazamientos para simular cuadras
    const off = (i % 2 === 0 ? 1 : -1) * 0.0009;
    pts.push(i % 2 === 0 ? [lat, lng + off] : [lat + off, lng]);
  }
  pts.push(to);
  return pts;
}

/** Recorrido circular alrededor de la casa (paseo al parque). */
export function parkLoop(home: LatLng): LatLng[] {
  return [
    home,
    [home[0] + 0.0008, home[1] + 0.0006],
    [home[0] + 0.0016, home[1] - 0.0004],
    [home[0] + 0.0011, home[1] - 0.0018],
    [home[0] + 0.0002, home[1] - 0.0012],
    home,
  ];
}

export const TRAVEL_MS = 3 * 60 * 1000; // trayecto simulado: 3 minutos
export const LOOP_MS = 2 * 60 * 1000; // paseo simulado: 2 minutos por vuelta
export const GEOFENCE_M = 150;
