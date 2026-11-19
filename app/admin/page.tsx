"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Home,
  Info,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Phone,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Siren,
  Truck,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { LiveMap, type MapMarker } from "@/components/map";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { LogoMark } from "@/components/shared/logo";
import { CAREGIVERS, EXTERNAL_SERVICES, MEDELLIN_CENTER, SPECIALTIES, getCaregiver, type LatLng, type Specialty } from "@/lib/data";
import { distanceMeters } from "@/lib/geo";
import { actions, activeSos, caregiverPosition, isBusy, salesToday, useDemo, useMounted, useNow, type ActivityItem } from "@/lib/store";
import { cn, formatCOP, formatTime, timeAgo } from "@/lib/utils";

const NAV = [
  { href: "#torre", label: "Torre de control", icon: LayoutDashboard },
  { href: "#servicios", label: "Servicios", icon: Radio },
  { href: "#personal", label: "Personal", icon: Users },
  { href: "#crm", label: "CRM WhatsApp", icon: MessageCircle },
  { href: "#finanzas", label: "Finanzas", icon: BarChart3 },
];

/** Posición de servicios externos: pequeño recorrido alrededor del hogar. */
function orbit(center: LatLng, now: number, seed: number): LatLng {
  const t = now / 40000 + seed;
  return [center[0] + Math.sin(t) * 0.0007, center[1] + Math.cos(t * 1.3) * 0.0007];
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach((d) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 880;
      g.gain.value = 0.06;
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + d);
      o.stop(ctx.currentTime + d + 0.2);
    });
  } catch {
    /* audio bloqueado por el navegador */
  }
}

export default function AdminPage() {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2"><RefreshCw className="h-5 w-5 animate-spin" /> Cargando torre de control…</div>
      </div>
    );
  }
  return <Admin />;
}

function Admin() {
  const state = useDemo();
  const now = useNow(1000);
  const [specFilter, setSpecFilter] = useState<Specialty | "Todas">("Todas");
  const [focus, setFocus] = useState<LatLng | undefined>();
  const sos = activeSos(state);
  const lastSos = useRef<string | undefined>(sos?.id);

  useEffect(() => {
    if (sos && sos.id !== lastSos.current && sos.status === "activa") {
      beep();
      setFocus(sos.position);
    }
    lastSos.current = sos?.id;
  }, [sos]);

  const storeLive = state.services.filter((s) => s.status === "aceptado" || s.status === "en_curso");
  const storeRunning = state.services.filter((s) => s.status === "en_curso");
  const pending = state.services.filter((s) => s.status === "pendiente");
  const available = CAREGIVERS.filter((c) => !isBusy(state, c.id));
  const sales = salesToday(state);
  const finishedCount = state.services.filter((s) => s.status === "finalizado").length + 9;

  const markers: MapMarker[] = useMemo(() => {
    const m: MapMarker[] = [];
    EXTERNAL_SERVICES.forEach((x, i) => {
      const cg = getCaregiver(x.caregiverId);
      m.push({ id: `h-${x.id}`, kind: "dot", position: x.center, color: "#94a3b8" });
      m.push({ id: `x-${x.id}`, kind: "caregiver", position: orbit(x.center, now, i * 1.7), photo: cg.photo, label: `${cg.name} · ${x.family}`, color: "#20b486" });
    });
    storeLive.forEach((s) => {
      const cg = getCaregiver(s.caregiverId);
      const isSos = sos?.serviceId === s.id;
      m.push({ id: `home-${s.id}`, kind: "home", position: s.home, label: s.address });
      m.push({
        id: `s-${s.id}`,
        kind: isSos ? "sos" : "caregiver",
        position: isSos ? sos!.position : caregiverPosition(s, now),
        photo: cg.photo,
        label: `${cg.name} · ${s.parentName} (${s.status === "en_curso" ? "en curso" : "en camino"})`,
        color: s.status === "en_curso" ? "#20b486" : "#1e6fd9",
      });
    });
    available.forEach((c) => m.push({ id: `a-${c.id}`, kind: "dot", position: c.base, color: "#25D366", label: `${c.name} · disponible` }));
    return m;
  }, [now, storeLive, available, sos]);

  const kpis = [
    { label: "Servicios en curso", value: EXTERNAL_SERVICES.length + storeRunning.length, sub: `${storeLive.length - storeRunning.length} en camino · ${pending.length} pendientes`, icon: Radio, tone: "bg-secondary text-primary" },
    { label: "Personal disponible", value: `${available.length}/${CAREGIVERS.length}`, sub: "verificados y en zona", icon: UserCheck, tone: "bg-mint-soft text-mint-foreground" },
    { label: "Ventas del día", value: formatCOP(sales), sub: "+18% vs. ayer", icon: DollarSign, tone: "bg-warm-soft text-orange-600" },
    {
      label: "Alertas activas",
      value: sos ? 1 : 0,
      sub: sos ? "SOS en curso" : "Operación normal",
      icon: sos ? Siren : ShieldCheck,
      tone: sos ? "bg-red-100 text-red-600" : "bg-mint-soft text-mint-foreground",
    },
  ];

  return (
    <div className="flex min-h-dvh bg-muted/40">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-navy p-4 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
          <LogoMark />
          <div className="leading-tight">
            <div className="font-display font-extrabold">Mi Casa Niñera</div>
            <div className="text-[11px] text-white/60">Panel Administrativo</div>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", i === 0 ? "bg-white/10" : "text-white/70 hover:bg-white/5 hover:text-white")}>
              <n.icon className="h-4 w-4" /> {n.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <div className="rounded-xl bg-white/5 p-3 text-xs text-white/70">
            <div className="mb-1 font-semibold text-white">Demo en tiempo real</div>
            Abre /colaboradores en otra pestaña y activa el SOS.
          </div>
          <button onClick={() => actions.reset()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <RotateCcw className="h-4 w-4" /> Reiniciar demo
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-[600] flex items-center gap-3 border-b bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="lg:hidden"><LogoMark /></div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black text-navy md:text-xl">Torre de Control</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-mint-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-mint" /> En vivo</span>
              · Medellín · {new Date(now).toLocaleTimeString("es-CO")}
            </div>
          </div>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => actions.reset()}>
            <RotateCcw /> Reiniciar
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href="/colaboradores" target="_blank" rel="noreferrer">App colaboradores ↗</a>
          </Button>
          <Avatar name="Admin Agencia" className="h-9 w-9 text-sm" />
        </header>

        <main id="torre" className="space-y-5 p-4 md:p-6">
          {/* SOS Banner */}
          {sos && <SosBanner now={now} onFocus={() => setFocus(sos.position)} />}

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className={cn("rounded-2xl border bg-white p-4 shadow-sm", k.label === "Alertas activas" && sos && "border-red-300 ring-2 ring-red-200")}>
                <div className="flex items-start justify-between">
                  <div className="text-xs font-semibold text-muted-foreground md:text-sm">{k.label}</div>
                  <div className={cn("grid h-9 w-9 place-items-center rounded-xl", k.tone)}>
                    <k.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 font-display text-xl font-black text-navy md:text-2xl">{k.value}</div>
                <div className="text-[11px] text-muted-foreground md:text-xs">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Mapa + actividad */}
          <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div className="flex items-center gap-2 font-bold text-navy"><MapPin className="h-4 w-4 text-primary" /> Mapa de operaciones en vivo</div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-mint" /> En curso</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> En camino</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-whatsapp" /> Disponible</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> SOS</span>
                </div>
              </div>
              <div className="h-[420px] md:h-[480px]">
                <LiveMap center={MEDELLIN_CENTER} zoom={13} markers={markers} follow={focus} />
              </div>
            </div>
            <ActivityFeed items={state.activity} now={now} />
          </div>

          {/* Servicios */}
          <section id="servicios" className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-bold text-navy">Servicios de hoy</div>
              <Badge variant="secondary">{state.services.length + EXTERNAL_SERVICES.length} registros</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Familia</th>
                    <th className="px-4 py-2.5">Colaborador</th>
                    <th className="px-4 py-2.5">Tipo</th>
                    <th className="px-4 py-2.5">Estado</th>
                    <th className="px-4 py-2.5">Horario</th>
                    <th className="px-4 py-2.5 text-right">Valor</th>
                    <th className="px-4 py-2.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {state.services.map((s) => {
                    const cg = getCaregiver(s.caregiverId);
                    const isSos = sos?.serviceId === s.id;
                    return (
                      <tr key={s.id} className={cn(isSos && "bg-red-50")}>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{s.parentName}</div>
                          <div className="text-xs text-muted-foreground">{s.childName} ({s.childAge}) · {s.source === "whatsapp" ? "WhatsApp IA" : s.source === "admin" ? "Agencia" : "App"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar src={cg.photo} name={cg.name} className="h-8 w-8 text-xs" />
                            <div>
                              <div className="font-medium">{cg.name}</div>
                              {s.backupFrom && <div className="text-[10px] font-semibold text-orange-600">Backup de {s.backupFrom}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{s.typeLabel}</td>
                        <td className="px-4 py-3">{isSos ? <Badge variant="destructive"><Siren /> SOS</Badge> : <StatusBadge status={s.status} />}</td>
                        <td className="px-4 py-3 text-xs">{s.date} {s.startTime} · {s.hours} h</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCOP(s.total)}</td>
                        <td className="px-4 py-3 text-right">
                          {(s.status === "pendiente" || s.status === "aceptado") && (
                            <Button size="sm" variant="outline" onClick={() => actions.backupExpress(s.id, "Reasignación manual")}>
                              <Zap className="text-warm" /> Backup Express
                            </Button>
                          )}
                          {s.status === "en_curso" && (
                            <Button size="sm" variant="ghost" onClick={() => setFocus(caregiverPosition(s, now))}>
                              <MapPin /> Ver
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {EXTERNAL_SERVICES.map((x) => {
                    const cg = getCaregiver(x.caregiverId);
                    return (
                      <tr key={x.id}>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{x.family}</div>
                          <div className="text-xs text-muted-foreground">{x.child} · {x.zone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar src={cg.photo} name={cg.name} className="h-8 w-8 text-xs" />
                            <span className="font-medium">{cg.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{x.type}</td>
                        <td className="px-4 py-3"><StatusBadge status="en_curso" /></td>
                        <td className="px-4 py-3 text-xs">Inició {timeAgo(now - x.startedMinAgo * 60000, now)} · {x.hours} h</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCOP(x.price)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setFocus(x.center)}>
                            <MapPin /> Ver
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            {/* Personal */}
            <section id="personal" className="rounded-2xl border bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div className="font-bold text-navy">Matriz de disponibilidad</div>
                <select
                  value={specFilter}
                  onChange={(e) => setSpecFilter(e.target.value as Specialty | "Todas")}
                  className="h-8 rounded-lg border bg-white px-2 text-xs font-semibold"
                >
                  <option>Todas</option>
                  {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {pending[0] && (
                <div className="flex items-center gap-2 border-b bg-warm-soft px-4 py-2 text-xs text-orange-800">
                  <Info className="h-4 w-4" /> Asignación rápida para: <strong>{pending[0].parentName}</strong> ({pending[0].typeLabel})
                </div>
              )}
              <ul className="divide-y">
                {CAREGIVERS.filter((c) => specFilter === "Todas" || c.specialties.includes(specFilter)).map((c) => {
                  const busy = isBusy(state, c.id);
                  const km = pending[0] ? distanceMeters(c.base, pending[0].home) / 1000 : null;
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="relative">
                        <Avatar src={c.photo} name={c.name} className="h-10 w-10" />
                        <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white", busy ? "bg-warm" : "bg-whatsapp")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          {c.name} <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {c.specialties.join(" · ")} · {c.zone}{km !== null && ` · ${km.toFixed(1)} km`}
                        </div>
                      </div>
                      <Badge variant={busy ? "warm" : "mint"}>{busy ? "Ocupado" : "Disponible"}</Badge>
                      <Button size="sm" variant={busy ? "ghost" : "default"} disabled={busy || !pending[0]} onClick={() => pending[0] && actions.assign(pending[0].id, c.id)}>
                        Asignar
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className="space-y-5">
              {/* CRM */}
              <section id="crm" className="rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2 font-bold text-navy"><MessageCircle className="h-4 w-4 text-whatsapp" /> Prospectos del Agente IA (WhatsApp)</div>
                  <Badge className="bg-whatsapp/15 text-whatsapp-dark">{state.leads.length}</Badge>
                </div>
                <ul className="divide-y">
                  {state.leads.slice(0, 6).map((l) => (
                    <li key={l.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <Avatar name={l.name} className="h-8 w-8 text-xs" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{l.name}</div>
                        <div className="truncate text-xs text-muted-foreground">“{l.interest}”</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={l.status === "convertido" ? "mint" : l.status === "en_reserva" ? "secondary" : "warm"}>
                          {l.status === "convertido" ? "Convertido" : l.status === "en_reserva" ? "En reserva" : "Nuevo"}
                        </Badge>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(l.at, now)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Finanzas */}
              <section id="finanzas" className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 font-bold text-navy"><BarChart3 className="h-4 w-4 text-primary" /> Finanzas y liquidaciones (hoy)</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">Facturación padres</div>
                    <div className="font-display text-lg font-black text-navy">{formatCOP(sales)}</div>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">Pago colaboradores (70%)</div>
                    <div className="font-display text-lg font-black text-navy">{formatCOP(sales * 0.7)}</div>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">Horas efectivas (OTP/QR)</div>
                    <div className="font-display text-lg font-black text-navy">{(41.5 + storeRunning.reduce((a, s) => a + s.hours, 0)).toFixed(1)} h</div>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">Comisión plataforma</div>
                    <div className="font-display text-lg font-black text-navy">{formatCOP(finishedCount * 2000)}</div>
                    <div className="text-[10px] text-muted-foreground">{finishedCount} servicios × $2.000</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs font-semibold">
                    <span>Meta diaria</span>
                    <span className="text-muted-foreground">{formatCOP(sales)} / {formatCOP(1800000)}</span>
                  </div>
                  <Progress value={(sales / 1800000) * 100} indicatorClassName="bg-gradient-to-r from-primary to-mint" />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SosBanner({ now, onFocus }: { now: number; onFocus: () => void }) {
  const state = useDemo();
  const sos = activeSos(state)!;
  const cg = getCaregiver(sos.caregiverId);
  const service = state.services.find((s) => s.id === sos.serviceId);
  const secs = Math.floor((now - sos.at) / 1000);
  const attended = sos.status === "atendida";
  return (
    <div className={cn("overflow-hidden rounded-2xl border-2 shadow-lg", attended ? "border-orange-400 bg-orange-50" : "animate-sos-pulse border-red-500 bg-red-600 text-white")}>
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-full", attended ? "bg-orange-500 text-white" : "bg-white text-red-600")}>
            <Siren className="h-7 w-7 animate-pulse" />
          </div>
          <Avatar src={cg.photo} name={cg.name} className="h-14 w-14 ring-2 ring-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-black tracking-wide md:text-xl">
              {attended ? "SOS EN ATENCIÓN" : "🚨 ALERTA CRÍTICA SOS"}
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", attended ? "bg-orange-200 text-orange-800" : "bg-white/20")}>
              hace {secs < 60 ? `${secs} s` : `${Math.floor(secs / 60)} min`}
            </span>
          </div>
          <div className={cn("text-sm", attended ? "text-orange-900" : "text-white/90")}>
            <strong>{cg.name}</strong> activó el botón de pánico · Servicio {service?.parentName} ({service?.childName}) · {service?.address}
          </div>
          <div className={cn("mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs", attended ? "text-orange-800" : "text-white/80")}>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {sos.position[0].toFixed(5)}, {sos.position[1].toFixed(5)}</span>
            <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Llamada 123 conectada</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp + GPS enviado a padres</span>
            {attended && sos.attendedAt && <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Apoyo despachado {formatTime(sos.attendedAt)}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="text-foreground" onClick={onFocus}><MapPin /> Ver en mapa</Button>
          <Button size="sm" variant="outline" className="text-foreground" onClick={() => window.alert(`Llamando a ${cg.name} · ${cg.phone} (simulado)`)}><Phone /> Llamar</Button>
          {!attended ? (
            <Button size="sm" className="bg-white text-red-600 hover:bg-white/90" onClick={() => actions.attendSOS(sos.id)}>
              <Truck /> Atender y despachar apoyo
            </Button>
          ) : (
            <Button size="sm" variant="mint" onClick={() => actions.resolveSOS(sos.id)}>
              <CheckCircle2 /> Marcar resuelta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityFeed({ items, now }: { items: ActivityItem[]; now: number }) {
  const icon = {
    info: { I: Info, c: "bg-secondary text-primary" },
    success: { I: CheckCircle2, c: "bg-mint-soft text-mint-foreground" },
    warning: { I: AlertTriangle, c: "bg-warm-soft text-orange-600" },
    danger: { I: Siren, c: "bg-red-100 text-red-600" },
  } as const;
  return (
    <div className="flex max-h-[540px] flex-col rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b px-4 py-3 font-bold text-navy">
        <Activity className="h-4 w-4 text-primary" /> Actividad en tiempo real
      </div>
      <ul className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-2">
        {items.map((a) => {
          const { I, c } = icon[a.kind];
          return (
            <li key={a.id} className={cn("flex gap-3 rounded-xl p-2.5", a.kind === "danger" && "bg-red-50")}>
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", c)}>
                <I className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm leading-snug">{a.text}</div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {timeAgo(a.at, now)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-2 border-t px-4 py-2.5 text-[11px] text-muted-foreground">
        <Home className="h-3.5 w-3.5" /> Sincronizado entre pestañas · listo para Supabase Realtime
      </div>
    </div>
  );
}
