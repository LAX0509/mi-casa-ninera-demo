"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, BookOpen, ChevronRight, HeartPulse, MapPin, MessageCircle, Search, Sparkles, Star, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { CaregiverProfileDialog } from "@/components/padres/caregiver-profile";
import { BookingDialog } from "@/components/padres/booking-dialog";
import { CAREGIVERS, SPECIALTIES, getCaregiver, type Caregiver, type Specialty } from "@/lib/data";
import { isBusy, parentFocusService, useDemo } from "@/lib/store";
import { kmFromHome, matchScore, neededSpecialties, topMatches } from "@/lib/matchmaking";
import { cn, formatCOP } from "@/lib/utils";

const SPECIALTY_ICON: Record<Specialty, typeof BookOpen> = {
  "Educación Infantil": Sparkles,
  "Primeros Auxilios": HeartPulse,
  "Tutoría de Matemáticas": BookOpen,
};

export default function PadresExplorar() {
  const state = useDemo();
  const [filter, setFilter] = useState<Specialty | "Todas">("Todas");
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [profile, setProfile] = useState<Caregiver | null>(null);
  const [booking, setBooking] = useState<Caregiver | null>(null);
  const [fromWhatsapp, setFromWhatsapp] = useState(false);

  useEffect(() => {
    setFromWhatsapp(new URLSearchParams(window.location.search).get("origen") === "whatsapp");
  }, []);

  const focus = parentFocusService(state);
  const matches = useMemo(() => topMatches(state.child), [state.child]);
  const needs = neededSpecialties(state.child);

  const list = CAREGIVERS.filter((c) => filter === "Todas" || c.specialties.includes(filter))
    .filter((c) => !onlyAvailable || !isBusy(state, c.id))
    .filter((c) => (c.name + c.title + c.zone).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => matchScore(b, state.child) - matchScore(a, state.child));

  return (
    <div className="space-y-6 p-4">
      {fromWhatsapp && (
        <div className="flex items-start gap-3 rounded-2xl bg-whatsapp/10 p-3.5 text-sm ring-1 ring-whatsapp/30">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-whatsapp-dark" />
          <div className="flex-1">
            <div className="font-semibold text-whatsapp-dark">Llegaste desde WhatsApp</div>
            <div className="text-muted-foreground">Lucía guardó tu consulta. Elige un perfil y confirma tu reserva en 2 minutos.</div>
          </div>
          <button onClick={() => setFromWhatsapp(false)} aria-label="Cerrar aviso">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {focus && focus.status !== "finalizado" && (
        <Link href="/padres/servicio" className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-sky-500 p-4 text-white shadow-soft">
          <Avatar src={getCaregiver(focus.caregiverId).photo} name={getCaregiver(focus.caregiverId).name} className="h-12 w-12 ring-2 ring-white/60" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-white/80">Tu servicio · {focus.date} {focus.startTime}</div>
            <div className="truncate font-bold">{getCaregiver(focus.caregiverId).name}</div>
            <div className="mt-1">
              <StatusBadge status={focus.status} />
            </div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Link>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mint-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Matchmaking inteligente
            </div>
            <h2 className="text-lg font-extrabold text-navy">Top 3 para {state.child.name}</h2>
          </div>
          <Link href="/padres/nino" className="text-xs font-semibold text-primary">Ajustar ficha</Link>
        </div>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {matches.map(({ c, score }, i) => (
            <button
              key={c.id}
              onClick={() => setProfile(c)}
              className="relative w-40 shrink-0 snap-start rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:shadow-soft"
            >
              {i === 0 && <Badge variant="warm" className="absolute right-2 top-2 px-1.5 text-[10px]">Mejor match</Badge>}
              <Avatar src={c.photo} name={c.name} className="h-14 w-14" />
              <div className="mt-2 truncate text-sm font-bold">{c.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">{c.title}</div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-mint" style={{ width: `${score}%` }} />
                </div>
                <span className="text-xs font-bold text-mint-foreground">{score}%</span>
              </div>
            </button>
          ))}
        </div>
        {needs.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">Basado en: {needs.join(" · ")} · cercanía a El Poblado · reputación</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-navy">Explorar cuidadores y tutores</h2>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, perfil o barrio" className="pl-10" />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {(["Todas", ...SPECIALTIES] as const).map((s) => {
            const Icon = s === "Todas" ? null : SPECIALTY_ICON[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  filter === s ? "border-primary bg-primary text-white" : "bg-white hover:bg-muted"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {s}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
          Mostrar solo disponibles ahora
        </label>

        <div className="space-y-3">
          {list.map((c) => {
            const busy = isBusy(state, c.id);
            return (
              <button
                key={c.id}
                onClick={() => setProfile(c)}
                className="flex w-full gap-3 rounded-2xl border bg-white p-3.5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-soft"
              >
                <div className="relative h-fit">
                  <Avatar src={c.photo} name={c.name} className="h-16 w-16 rounded-2xl" />
                  <span className={cn("absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white", busy ? "bg-warm" : "bg-whatsapp")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-bold text-navy">{c.name}</span>
                    <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{c.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-0.5 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {c.rating}
                      <span className="font-normal text-muted-foreground">({c.reviewsCount})</span>
                    </span>
                    <span className="text-muted-foreground">· {c.years} años exp.</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.specialties.map((s) => (
                      <span key={s} className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between text-right">
                  <div>
                    <div className="text-sm font-black text-navy">{formatCOP(c.hourlyRate)}</div>
                    <div className="text-[10px] text-muted-foreground">/hora</div>
                  </div>
                  <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {kmFromHome(c).toFixed(1)} km
                  </div>
                </div>
              </button>
            );
          })}
          {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay perfiles con esos filtros.</p>}
        </div>
      </section>

      <CaregiverProfileDialog
        caregiver={profile}
        busy={profile ? isBusy(state, profile.id) : false}
        match={profile ? matchScore(profile, state.child) : undefined}
        onClose={() => setProfile(null)}
        onBook={(c) => {
          setProfile(null);
          setTimeout(() => setBooking(c), 150);
        }}
      />
      <BookingDialog caregiver={booking} onClose={() => setBooking(null)} source={fromWhatsapp ? "whatsapp" : "app"} />
    </div>
  );
}
