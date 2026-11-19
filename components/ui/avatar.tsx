"use client";

import * as React from "react";
import { cn, initials } from "@/lib/utils";

/** Avatar con respaldo de iniciales si la foto remota no carga. */
export function Avatar({ src, name, className }: { src?: string; name: string; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  return (
    <div
      className={cn(
        "relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary/80 to-mint font-bold text-white",
        className
      )}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="text-[0.8em]">{initials(name)}</span>
      )}
    </div>
  );
}

/** Imagen con respaldo ilustrado si la URL remota falla. */
export function SafeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed)
    return (
      <div className={cn("grid place-items-center bg-gradient-to-br from-mint-soft via-secondary to-warm-soft text-3xl", className)}>
        <span role="img" aria-label={alt}>
          🧸
        </span>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={cn("object-cover", className)} onError={() => setFailed(true)} />;
}
