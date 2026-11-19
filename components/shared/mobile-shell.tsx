"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/store";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  dot?: boolean;
}

/** Contenedor mobile-first: en escritorio se ve como un teléfono centrado. */
export function MobileShell({
  header,
  nav,
  children,
  aside,
}: {
  header: React.ReactNode;
  nav?: NavItem[];
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const pathname = usePathname();
  const mounted = useMounted();
  return (
    <div className="bg-hero min-h-dvh lg:flex lg:items-start lg:justify-center lg:gap-10 lg:py-8">
      {aside && <div className="sticky top-8 hidden w-72 shrink-0 lg:block">{aside}</div>}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background lg:mx-0 lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:overflow-hidden lg:rounded-[2.2rem] lg:border-[6px] lg:border-navy lg:shadow-2xl">
        <header className="sticky top-0 z-40 border-b bg-white/90 px-4 py-3 backdrop-blur">{header}</header>
        <main className={cn("flex-1 lg:overflow-y-auto lg:scrollbar-thin", nav && "pb-24")}>
          {mounted ? (
            children
          ) : (
            <div className="grid h-64 place-items-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </main>
        {nav && (
          <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md border-t bg-white/95 px-2 pt-1.5 backdrop-blur lg:absolute">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn("grid h-8 w-12 place-items-center rounded-full transition", active && "bg-secondary")}>
                    <n.icon className="h-5 w-5" />
                  </div>
                  {n.label}
                  {n.dot && <span className="absolute right-[calc(50%-18px)] top-1 h-2.5 w-2.5 rounded-full bg-mint ring-2 ring-white" />}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export function BackToHome() {
  return (
    <Link href="/" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Volver al inicio">
      <ArrowLeft className="h-5 w-5" />
    </Link>
  );
}

/** Panel lateral (solo escritorio) con guía de la demo. */
export function DemoAside({ title, steps, links }: { title: string; steps: string[]; links: { href: string; label: string }[] }) {
  return (
    <div className="rounded-3xl border bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-wider text-primary">Guía de la demo</div>
      <div className="mt-1 font-display text-xl font-black text-navy">{title}</div>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{i + 1}</span>
            <span className="text-muted-foreground">{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-col gap-2 border-t pt-4">
        {links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">
            ↗ {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
