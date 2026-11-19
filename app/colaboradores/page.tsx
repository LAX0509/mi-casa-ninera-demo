"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Camera,
  CheckCircle2,
  Clock,
  Heart,
  Inbox,
  KeyRound,
  MapPin,
  Navigation,
  NotebookPen,
  RefreshCw,
  Sparkles,
  Star,
  Video,
  Wallet,
  XCircle,
} from "lucide-react";
import { BackToHome, DemoAside, MobileShell } from "@/components/shared/mobile-shell";
import { LiveMap } from "@/components/map";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceChat } from "@/components/shared/service-chat";
import { SosButton, SosProtocolDialog } from "@/components/colaboradores/sos";
import { CheckInDialog } from "@/components/colaboradores/check-in";
import { ClosingLogDialog } from "@/components/colaboradores/closing-log";
import { CAREGIVERS, KID_PHOTOS, PARENT, getCaregiver } from "@/lib/data";
import { GEOFENCE_M, distanceMeters, routeBetween } from "@/lib/geo";
import { actions, caregiverPosition, etaMinutes, useDemo, useNow, type Service } from "@/lib/store";
import { cn, formatCOP } from "@/lib/utils";

const COMPANION: Record<string, string[]> = {
  small: [
    "🎨 Pintura con esponjas: trabaja motricidad fina y colores primarios (15 min).",
    "🦕 Búsqueda del tesoro de dinosaurios: esconde 5 figuras y da pistas con números.",
    "🎶 Canción “Head, shoulders, knees and toes” para vocabulario en inglés.",
    "🧩 Clasificar objetos por forma y color con elementos de la cocina.",
  ],
  big: [
    "🧮 Bingo de multiplicaciones: refuerza tablas del 6 al 9 con fichas.",
    "📏 Recetas con fracciones: medir ingredientes de una merienda saludable.",
    "📖 Lectura en voz alta + 3 preguntas de comprensión inferencial.",
    "🧠 Retos de lógica tipo Sudoku 4×4 para concentración.",
  ],
};

export default function Colaboradores() {
  const state = useDemo();
  const now = useNow(1000);
  const me = getCaregiver(state.currentCollaboratorId);
  const mine = state.services.filter((s) => s.caregiverId === me.id);
  const pending = mine.filter((s) => s.status === "pendiente");
  const accepted = mine.filter((s) => s.status === "aceptado");
  const active = mine.find((s) => s.status === "en_curso");
  const finished = mine.filter((s) => s.status === "finalizado");
  const mySos = state.sos.find((a) => a.caregiverId === me.id && (a.status !== "resuelta" || now - (a.resolvedAt ?? 0) < 8000));
  const [sosOpen, setSosOpen] = useState(true);
  const [checkIn, setCheckIn] = useState<Service | null>(null);
  const [closing, setClosing] = useState(false);

  const current = active ?? accepted[0];

  function triggerSos() {
    if (!current) return;
    actions.triggerSOS(current.id, me.id, caregiverPosition(current, Date.now()));
    setSosOpen(true);
  }

  const earningsWeek = 486000 + finished.reduce((a, s) => a + s.total * 0.7, 0);

  return (
    <MobileShell
      aside={
        <DemoAside
          title="App de Colaboradores"
          steps={[
            "Acepta la solicitud pendiente después de leer la ficha del niño.",
            "Simula la llegada y haz check-in con el OTP que aparece en la App de Padres (o escanea el QR).",
            "Mantén presionado el botón SOS: la alerta aparece al instante en la Torre de Control.",
            "Finaliza el servicio con la bitácora, checklist y firma digital.",
          ]}
          links={[
            { href: "/padres/servicio", label: "Abrir App de Padres (en vivo)" },
            { href: "/admin", label: "Abrir Torre de Control" },
          ]}
        />
      }
      header={
        <div className="flex items-center gap-2">
          <BackToHome />
          <Avatar src={me.photo} name={me.name} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <select
              value={me.id}
              onChange={(e) => actions.setCollaborator(e.target.value)}
              className="w-full truncate bg-transparent font-display text-[15px] font-extrabold text-navy outline-none"
              aria-label="Cambiar colaborador (demo)"
            >
              {CAREGIVERS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full", active ? "bg-mint" : "bg-whatsapp")} />
              {active ? "En servicio" : "Disponible"} · <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {me.rating}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-5 p-4">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-gradient-to-br from-mint to-emerald-500 p-3 text-white">
            <Wallet className="h-4 w-4" />
            <div className="mt-1 text-sm font-black">{formatCOP(earningsWeek)}</div>
            <div className="text-[10px] text-white/80">esta semana</div>
          </div>
          <div className="rounded-2xl border bg-white p-3">
            <Inbox className="h-4 w-4 text-warm" />
            <div className="mt-1 text-sm font-black text-navy">{pending.length}</div>
            <div className="text-[10px] text-muted-foreground">solicitudes</div>
          </div>
          <div className="rounded-2xl border bg-white p-3">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <div className="mt-1 text-sm font-black text-navy">{me.services + finished.length}</div>
            <div className="text-[10px] text-muted-foreground">servicios</div>
          </div>
        </div>

        {/* Servicio en curso */}
        {active && (
          <ActiveService
            service={active}
            now={now}
            onSos={triggerSos}
            onClose={() => setClosing(true)}
            sosActive={!!mySos && mySos.status !== "resuelta"}
          />
        )}

        {/* Servicios aceptados → check-in */}
        {!active &&
          accepted.map((s) => {
            const pos = caregiverPosition(s, now);
            const dist = distanceMeters(pos, s.home);
            const inside = dist <= GEOFENCE_M;
            const eta = etaMinutes(s, now);
            return (
              <section key={s.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center justify-between p-4 pb-3">
                  <div>
                    <div className="text-xs font-semibold text-primary">PRÓXIMO SERVICIO · {s.date} {s.startTime}</div>
                    <div className="font-bold text-navy">{s.parentName} · {s.childName} ({s.childAge})</div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="relative h-48">
                  <LiveMap
                    center={s.home}
                    zoom={15}
                    follow={pos}
                    geofence={{ center: s.home, radius: GEOFENCE_M, color: inside ? "#20b486" : "#1e6fd9" }}
                    route={!s.arrivedAt ? routeBetween(me.base, s.home) : undefined}
                    markers={[
                      { id: "home", kind: "home", position: s.home, label: s.address },
                      { id: "me", kind: "caregiver", position: pos, photo: me.photo, label: "Tú" },
                    ]}
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" /> {s.address}
                  </div>
                  <div className={cn("flex items-center gap-2 rounded-xl p-3 text-sm font-semibold", inside ? "bg-mint-soft text-mint-foreground" : "bg-secondary text-secondary-foreground")}>
                    <Navigation className="h-4 w-4" />
                    {inside ? "Dentro de la geocerca · puedes hacer check-in" : `A ${Math.round(dist)} m · llegada estimada ${eta} min`}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {!inside && (
                      <Button variant="outline" onClick={() => actions.arrive(s.id)}>
                        <Navigation /> Simular llegada
                      </Button>
                    )}
                    <Button className={cn(inside && "col-span-2")} disabled={!inside} onClick={() => setCheckIn(s)}>
                      <KeyRound /> Check-in OTP / QR
                    </Button>
                  </div>
                  <ChildCard service={s} />
                  <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/60 p-3">
                    <div className="text-xs text-red-800">
                      <div className="font-bold">¿Emergencia en camino?</div>
                      Activa el protocolo SOS.
                    </div>
                    <SosButton compact onTrigger={triggerSos} />
                  </div>
                </div>
              </section>
            );
          })}

        {/* Solicitudes pendientes */}
        {pending.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-navy">
              <Inbox className="h-5 w-5 text-warm" /> Nuevas solicitudes
            </h2>
            {pending.map((s) => (
              <div key={s.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-navy">{s.parentName}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.typeLabel} · {s.date} {s.startTime} · {s.hours} h
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-mint-foreground">{formatCOP(s.total * 0.7)}</div>
                    <div className="text-[10px] text-muted-foreground">tu pago (70%)</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.source === "whatsapp" && <Badge className="bg-whatsapp/15 text-whatsapp-dark">Vía WhatsApp IA</Badge>}
                  <Badge variant="muted"><MapPin /> {(distanceMeters(me.base, s.home) / 1000).toFixed(1)} km</Badge>
                </div>
                {s.notes && <p className="mt-2 rounded-xl bg-muted/60 p-2.5 text-xs text-muted-foreground">“{s.notes}”</p>}
                <div className="mt-3">
                  <ChildCard service={s} />
                </div>
                <div className="mt-3 grid grid-cols-[1fr_2fr] gap-2">
                  <Button variant="outline" onClick={() => actions.declineService(s.id)}>
                    <XCircle /> Rechazar
                  </Button>
                  <Button variant="mint" onClick={() => actions.acceptService(s.id)} disabled={!!active}>
                    <CheckCircle2 /> Aceptar servicio
                  </Button>
                </div>
              </div>
            ))}
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" /> Si rechazas, Backup Express reasigna al colaborador más cercano.
            </p>
          </section>
        )}

        {!active && accepted.length === 0 && pending.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-2 font-bold text-navy">Sin solicitudes por ahora</div>
            <p className="mt-1 text-sm text-muted-foreground">Reserva desde la App de Padres o cambia de colaborador arriba.</p>
          </div>
        )}

        {finished.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-navy">Servicios cerrados hoy</h2>
            {finished.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-2xl border bg-white p-3 text-sm">
                <div>
                  <div className="font-semibold">{s.parentName} · {s.childName}</div>
                  <div className="text-xs text-muted-foreground">Bitácora y pase de salida enviados</div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </section>
        )}
      </div>

      {checkIn && <CheckInDialog service={checkIn} open={!!checkIn} onClose={() => setCheckIn(null)} />}
      {active && <ClosingLogDialog service={active} open={closing} onClose={() => setClosing(false)} />}
      <SosProtocolDialog alert={sosOpen ? mySos : undefined} onClose={() => setSosOpen(false)} />
    </MobileShell>
  );
}

function ChildCard({ service }: { service: Service }) {
  const { child } = useDemo();
  const isDemoFamily = service.parentName === PARENT.name;
  return (
    <div className="space-y-2 rounded-2xl bg-secondary/50 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-navy">
        <Heart className="h-3.5 w-3.5 text-warm" /> Ficha de {service.childName} ({service.childAge} años)
      </div>
      {isDemoFamily ? (
        <>
          <div className="flex gap-1.5 rounded-lg bg-red-50 p-2 text-red-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span><strong>Alergias:</strong> {child.allergies}</span>
          </div>
          <div><strong>Gustos:</strong> {child.likes}</div>
          <div><strong>Rutina:</strong> {child.routines}</div>
          <div><strong>Recomendaciones:</strong> {child.recommendations}</div>
        </>
      ) : (
        <>
          <div className="flex gap-1.5 rounded-lg bg-mint-soft p-2 text-mint-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Sin alergias reportadas
          </div>
          <div><strong>Gustos:</strong> Fútbol, Minecraft, experimentos de ciencia</div>
          <div><strong>Objetivo:</strong> Refuerzo de fracciones y problemas verbales</div>
        </>
      )}
    </div>
  );
}

function ActiveService({ service, now, onSos, onClose, sosActive }: { service: Service; now: number; onSos: () => void; onClose: () => void; sosActive: boolean }) {
  const me = getCaregiver(service.caregiverId);
  const pos = caregiverPosition(service, now);
  const [tipIdx, setTipIdx] = useState(0);
  const [thinking, setThinking] = useState(false);
  const tips = service.childAge <= 7 ? COMPANION.small : COMPANION.big;
  const mins = Math.floor((now - (service.checkInAt ?? now)) / 60000);
  const secs = Math.floor(((now - (service.checkInAt ?? now)) / 1000) % 60);

  function nextTip() {
    setThinking(true);
    setTimeout(() => {
      setTipIdx((i) => (i + 1) % tips.length);
      setThinking(false);
    }, 700);
  }

  function sendPhoto(video?: boolean) {
    const img = KID_PHOTOS[Math.floor(Math.random() * KID_PHOTOS.length)];
    actions.sendMessage(service.id, "colaborador", video ? `Un momento especial de ${service.childName} 🎥` : `${service.childName} está feliz jugando 💙`, { image: img, video });
  }

  return (
    <section className="space-y-4">
      <div className={cn("rounded-2xl p-4 text-white shadow-soft", sosActive ? "bg-gradient-to-br from-red-600 to-red-700" : "bg-gradient-to-br from-primary to-sky-500")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/80">{sosActive ? "🚨 SOS ACTIVO" : "SERVICIO EN CURSO"}</div>
            <div className="text-lg font-extrabold">{service.childName} · {service.parentName}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 font-mono text-2xl font-bold">
              <Clock className="h-5 w-5" /> {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-white/80">Check-in {service.checkInMethod} ✓</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center rounded-2xl border-2 border-red-200 bg-gradient-to-b from-red-50 to-white p-5">
        <SosButton onTrigger={onSos} />
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Llama a emergencias, a los padres y alerta a la torre de control con tu GPS en vivo.
        </p>
      </div>

      <div className="relative h-44 overflow-hidden rounded-2xl border">
        <LiveMap
          center={service.home}
          zoom={16}
          follow={pos}
          geofence={{ center: service.home, radius: GEOFENCE_M }}
          markers={[
            { id: "home", kind: "home", position: service.home },
            { id: "me", kind: sosActive ? "sos" : "caregiver", position: pos, photo: me.photo, label: "Tu ubicación" },
          ]}
        />
      </div>

      <div className="rounded-2xl border border-mint/30 bg-gradient-to-br from-mint-soft to-white p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-navy">KidsCompanion AI</div>
            <div className="text-[11px] text-muted-foreground">Copiloto pedagógico · {service.childAge} años</div>
          </div>
          <Button size="sm" variant="outline" onClick={nextTip}>
            <Sparkles className={cn(thinking && "animate-spin")} /> Otra idea
          </Button>
        </div>
        <p className={cn("mt-3 rounded-xl bg-white p-3 text-sm shadow-sm transition", thinking && "opacity-40")}>{tips[tipIdx]}</p>
      </div>

      <ServiceChat
        serviceId={service.id}
        me="colaborador"
        otherName={service.parentName}
        className="h-[380px]"
        quickActions={[
          { label: "📸 Enviar foto", onClick: () => sendPhoto() },
          { label: "🎥 Enviar video", onClick: () => sendPhoto(true) },
          { label: "✅ Merienda lista", onClick: () => actions.sendMessage(service.id, "colaborador", `${service.childName} ya merendó 🍎`) },
          { label: "📚 Tareas listas", onClick: () => actions.sendMessage(service.id, "colaborador", "¡Tareas completadas! 📚✨") },
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => sendPhoto()}>
          <Camera /> Foto
        </Button>
        <Button variant="outline" onClick={() => sendPhoto(true)}>
          <Video /> Video
        </Button>
      </div>
      <Button size="lg" variant="default" className="w-full" onClick={onClose}>
        <NotebookPen /> Finalizar y llenar bitácora
      </Button>
    </section>
  );
}
