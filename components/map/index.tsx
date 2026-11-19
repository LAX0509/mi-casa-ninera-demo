"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

export type { MapMarker, LiveMapProps } from "./live-map";

export const LiveMap = dynamic(() => import("./live-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-secondary/60">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MapPin className="h-4 w-4 animate-bounce text-primary" /> Cargando mapa en vivo…
      </div>
    </div>
  ),
});
