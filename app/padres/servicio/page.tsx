"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Clock,
  Compass,
  FileSignature,
  Hourglass,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  PhoneOff,
  ShieldCheck,
  Siren,
  Star,
  Utensils,
  NotebookPen,
  Smile,
} from "lucide-react";
import { LiveMap } from "@/components/map";
import { Avatar, SafeImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceChat } from "@/components/shared/service-chat";
import { KID_PHOTOS, getCaregiver } from "@/lib/data";
import { GEOFENCE_M, distanceMeters, routeBetween } from "@/lib/geo";
import { actions, activeSos, caregiverPosition, etaMinutes, parentFocusService, useDemo, useNow, type Service } from "@/lib/store";
import { cn, formatCOP, formatTime } from "@/lib/utils";

const STEPS = [
  { key: "pendiente", label: "Solicitud" },
  { key: "aceptado", label: "En camino" },
  { key: "en_curso", label: "En curso" },
  { key: "finalizado", label: "Finalizado" },
] as const;

function Stepper({ status }: { status: Service["status"] }) {
  const idx = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex flex-1 flex-col gap-1">
          <div className={cn("h-1.5 rounded-full", i <= idx ? "bg-primary" : "bg-muted")} />
          <span className={cn("text-[10px] font-semibold", i <= idx ? "text-primary" : "text-muted-foreground")}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ServicioActivo() {
  const state = useDemo();
  const now = useNow(1000);
  const [calling, setCalling] = useState(false);
  const service = parentFocusService(state);

  if (!service) {
    return (
      <div className="grid place-items-center p-10 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary">
          <Compass className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-navy">Sin servicios activos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Reserva un cuidador(a) para seguir el servicio en vivo.</p>
        <Button asChild className="mt-5">
          <Link href="/padres">Explorar perfiles</Link>
        </Button>
      </div>
    );
  }

  const cg = getCaregiver(service.caregiverId);
  const pos = caregiverPosition(service, now);
  const dist = distanceMeters(pos, service.home);
  const eta = etaMinutes(service, now);
  const sos = activeSos(state);
  const sosHere = sos && sos.serviceId === service.id;
  const live = service.status === "aceptado" || service.status === "en_curso";

  const elapsedMin = service.checkInAt ? Math.floor((now - service.checkInAt) / 60000) : 0;
  const elapsedSec = service.checkInAt ? Math.floor(((now - service.checkInAt) / 1000) % 60) : 0;
  // 1 minuto real = 1 hora simulada para ver el progreso en la demo
  const progress = service.checkInAt ? Math.min(100, ((now - service.checkInAt) / (service.hours * 60000)) * 100) : 0;

  function ask(kind: "foto" | "video" | "estado") {
    if (!service) return;
    const prompts = {
      foto: `¿Me envías una foto de ${service.childName}? 📸`,
      video: `¿Me mandas un videíto de ${service.childName}? 🎥`,
      estado: "¿Cómo va todo? 😊",
    };
    actions.sendMessage(service.id, "padre", prompts[kind]);
    const id = service.id;
    const enCurso = service.status === "en_curso";
    setTimeout(() => {
      if (!enCurso) {
        actions.sendMessage(id, "colaborador", "¡Estoy en camino! Apenas llegue y haga check-in te envío 😊");
        return;
      }
      const img = KID_PHOTOS[Math.floor(Math.random() * KID_PHOTOS.length)];
      if (kind === "foto") actions.sendMessage(id, "colaborador", `¡Claro! Aquí está ${service.childName} pintando dinosaurios 🦕🎨`, { image: img });
      else if (kind === "video") actions.sendMessage(id, "colaborador", "Mira cómo cantó la canción en inglés 🎶", { image: img, video: true });
      else actions.sendMessage(id, "colaborador", `¡Todo súper bien! Ya merendó y estamos haciendo las tareas de matemáticas con juegos 🧮`);
    }, 2200);
  }

  const gallery = state.messages.filter((m) => m.serviceId === service.id && m.image);

  return (
    <div className="space-y-4 p-4">
      {sosHere && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4">
          <div className="flex items-center gap-2 font-bold text-red-700">
            <Siren className="h-5 w-5 animate-pulse" /> Protocolo SOS en curso
          </div>
          <p className="mt-1 text-sm text-red-700/80">
            {cg.name} activó una alerta. Se notificó a emergencias y la torre de control {sos.status === "atendida" ? "ya despachó apoyo" : "está atendiendo"}. Te enviamos la ubicación GPS por WhatsApp.
          </p>
        </div>
      )}

      {/* Encabezado del servicio */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar src={cg.photo} name={cg.name} className="h-14 w-14" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-bold text-navy">{cg.name}</span>
              <StatusBadge status={service.status} />
            </div>
            <div className="text-xs text-muted-foreground">
              {service.typeLabel} · {service.date} {service.startTime} · {service.hours} h
            </div>
            {service.backupFrom && <Badge variant="warm" className="mt-1">Backup Express · reemplaza a {service.backupFrom}</Badge>}
          </div>
          {live && (
            <Button size="icon" variant="mint" className="rounded-full" onClick={() => setCalling(true)} aria-label="Llamar">
              <Phone />
            </Button>
          )}
        </div>
        <div className="mt-4">
          <Stepper status={service.status} />
        </div>
      </div>

      {service.status === "pendiente" && (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-secondary/50 p-5 text-center">
          <Hourglass className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <div className="mt-2 font-bold text-navy">Esperando confirmación de {cg.name.split(" ")[0]}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Está revisando la ficha de {service.childName}. Si no puede asistir, Backup Express asigna a otro profesional automáticamente.
          </p>
          <a href="/colaboradores" target="_blank" className="mt-3 inline-block text-xs font-semibold text-primary underline">
            Demo: abrir App de Colaboradores para aceptar ↗
          </a>
        </div>
      )}

      {live && (
        <>
          <div className="relative h-64 overflow-hidden rounded-2xl border shadow-sm">
            <LiveMap
              center={service.home}
              zoom={15}
              follow={pos}
              geofence={{ center: service.home, radius: GEOFENCE_M }}
              route={service.status === "aceptado" && !service.arrivedAt ? routeBetween(cg.base, service.home) : undefined}
              markers={[
                { id: "home", kind: "home", position: service.home, label: "Tu casa" },
                { id: "cg", kind: sosHere ? "sos" : "caregiver", position: pos, photo: cg.photo, label: cg.name },
              ]}
            />
            <div className="pointer-events-none absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold shadow">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> EN VIVO
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex items-center gap-3 rounded-xl bg-white/95 p-3 shadow">
              <Navigation className="h-5 w-5 text-primary" />
              <div className="flex-1 text-xs">
                {service.status === "aceptado" ? (
                  eta > 0 ? (
                    <>
                      <div className="font-bold text-navy">Llega en ~{eta} min</div>
                      <div className="text-muted-foreground">{(dist / 1000).toFixed(1)} km de tu casa</div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-navy">¡Llegó a tu casa! 📍</div>
                      <div className="text-muted-foreground">Comparte el código OTP para iniciar</div>
                    </>
                  )
                ) : (
                  <>
                    <div className="font-bold text-navy">{dist < 40 ? "En casa" : "Paseo al parque"} · {Math.round(dist)} m de casa</div>
                    <div className="text-muted-foreground">{dist <= GEOFENCE_M ? "Dentro de la geocerca ✅" : "Fuera de la geocerca (paseo autorizado)"}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {service.status === "aceptado" && (
            <div className="flex items-center gap-4 rounded-2xl bg-navy p-4 text-white shadow-soft">
              <div className="rounded-xl bg-white p-2">
                <QRCodeSVG value={`MCN|${service.id}|${service.otp}`} size={84} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <KeyRound className="h-3.5 w-3.5" /> Código de check-in
                </div>
                <div className="font-display text-4xl font-black tracking-[0.3em]">{service.otp}</div>
                <p className="mt-1 text-[11px] leading-snug text-white/70">Compártelo solo cuando {cg.name.split(" ")[0]} esté en tu puerta. Así garantizamos horas transparentes.</p>
              </div>
            </div>
          )}

          {service.status === "en_curso" && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border bg-white p-3">
                <Clock className="h-4 w-4 text-primary" />
                <div className="mt-1 font-display text-lg font-black text-navy">
                  {String(elapsedMin).padStart(2, "0")}:{String(elapsedSec).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-muted-foreground">desde check-in</div>
              </div>
              <div className="rounded-2xl border bg-white p-3">
                <ShieldCheck className="h-4 w-4 text-mint" />
                <div className="mt-1 text-sm font-bold text-navy">{service.checkInMethod}</div>
                <div className="text-[10px] text-muted-foreground">{service.checkInAt ? formatTime(service.checkInAt) : ""}</div>
              </div>
              <div className="rounded-2xl border bg-white p-3">
                <MapPin className="h-4 w-4 text-warm" />
                <div className="mt-1 text-sm font-bold text-navy">{dist <= GEOFENCE_M ? "Geocerca" : "Parque"}</div>
                <div className="text-[10px] text-muted-foreground">{Math.round(dist)} m</div>
              </div>
              <div className="col-span-3 rounded-2xl border bg-white p-3">
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span>Progreso de la jornada</span>
                  <span className="text-muted-foreground">{Math.round(progress)}% de {service.hours} h</span>
                </div>
                <Progress value={progress} indicatorClassName="bg-gradient-to-r from-primary to-mint" />
              </div>
            </div>
          )}

          {gallery.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-bold text-navy">Momentos de hoy</div>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
                {gallery.map((g) => (
                  <SafeImage key={g.id} src={g.image!} alt="Momento" className="h-24 w-24 shrink-0 rounded-xl" />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {service.status !== "finalizado" && (
        <ServiceChat
          serviceId={service.id}
          me="padre"
          otherName={cg.name}
          otherPhoto={cg.photo}
          className="h-[420px]"
          quickActions={[
            { label: "📸 Pedir foto", onClick: () => ask("foto") },
            { label: "🎥 Pedir video", onClick: () => ask("video") },
            { label: "💬 ¿Cómo va todo?", onClick: () => ask("estado") },
          ]}
        />
      )}

      {service.status === "finalizado" && service.log && <Report service={service} />}

      <CallDialog open={calling} onClose={() => setCalling(false)} name={cg.name} photo={cg.photo} />
    </div>
  );
}

function Report({ service }: { service: Service }) {
  const cg = getCaregiver(service.caregiverId);
  const log = service.log!;
  const [rating, setRating] = useState(0);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-mint to-emerald-500 p-5 text-white">
        <CheckCircle2 className="h-8 w-8" />
        <div className="mt-2 font-display text-xl font-black">Servicio finalizado</div>
        <p className="text-sm text-white/85">
          {cg.name} entregó a {service.childName} a las {formatTime(log.at)} · Total {formatCOP(service.total)}
        </p>
      </div>
      <div className="space-y-4 rounded-2xl border bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-navy">
          <NotebookPen className="h-4 w-4 text-primary" /> Bitácora del día
        </div>
        <div className="flex flex-wrap gap-1.5">
          {log.activities.map((a) => (
            <Badge key={a} variant="secondary">{a}</Badge>
          ))}
        </div>
        <div className="grid gap-3 text-sm">
          <div className="flex gap-2"><Utensils className="mt-0.5 h-4 w-4 shrink-0 text-warm" /><span><strong>Alimentación:</strong> {log.food}</span></div>
          <div className="flex gap-2"><NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong>Tareas:</strong> {log.homework}</span></div>
          <div className="flex gap-2"><Smile className="mt-0.5 h-4 w-4 shrink-0 text-mint" /><span><strong>Estado de ánimo:</strong> {log.mood}</span></div>
          {log.observations && <p className="rounded-xl bg-muted/60 p-3 text-muted-foreground">{log.observations}</p>}
        </div>
        <div className="rounded-xl border border-mint/30 bg-mint-soft p-3 text-sm">
          <div className="font-bold text-mint-foreground">💡 Recomendaciones para los padres</div>
          <p className="mt-1 text-mint-foreground/90">{log.recommendations}</p>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-navy">
            <FileSignature className="h-4 w-4 text-primary" /> Pase de salida digital
          </div>
          <ul className="space-y-1 text-sm">
            {log.checklist.map((c) => (
              <li key={c} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-mint" /> {c}</li>
            ))}
          </ul>
          {log.signature && (
            <div className="mt-3 rounded-xl border bg-muted/30 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={log.signature} alt="Firma del colaborador" className="h-20" />
              <div className="border-t pt-1 text-[10px] text-muted-foreground">Firma digital · {cg.name} · {formatTime(log.at)}</div>
            </div>
          )}
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4 text-center">
        <div className="text-sm font-bold text-navy">¿Cómo calificas a {cg.name.split(" ")[0]}?</div>
        <div className="mt-2 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)} aria-label={`${i} estrellas`}>
              <Star className={cn("h-8 w-8 transition", i <= rating ? "fill-amber-400 text-amber-400" : "text-muted")} />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="mt-2 text-xs text-mint-foreground">¡Gracias! Tu reseña ayuda a otras familias 💙</p>}
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/padres">Reservar de nuevo</Link>
        </Button>
      </div>
    </div>
  );
}

function CallDialog({ open, onClose, name, photo }: { open: boolean; onClose: () => void; name: string; photo: string }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent hideClose className="max-w-sm bg-navy text-white">
        <div className="flex flex-col items-center p-8 text-center">
          <div className="relative">
            <span className="absolute inset-0 animate-ping rounded-full bg-mint/40" />
            <Avatar src={photo} name={name} className="relative h-24 w-24 ring-4 ring-white/20" />
          </div>
          <DialogTitle className="mt-5 text-white">{name}</DialogTitle>
          <DialogDescription className="text-white/70">Llamada de voz segura · conectando…</DialogDescription>
          <Button variant="destructive" size="icon" className="mt-8 h-14 w-14 rounded-full" onClick={onClose} aria-label="Colgar">
            <PhoneOff className="!size-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
