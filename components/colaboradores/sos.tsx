"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCheck, CheckCircle2, Loader2, MapPin, MessageCircle, Mic, Phone, PhoneMissed, ShieldAlert, Siren, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PARENT } from "@/lib/data";
import { actions, useNow, type SosAlert } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Botón de pánico: mantener presionado 1.2 s para evitar activaciones accidentales. */
export function SosButton({ onTrigger, compact }: { onTrigger: () => void; compact?: boolean }) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const start = useRef(0);
  const HOLD = 1200;

  function begin() {
    cancel();
    start.current = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start.current) / HOLD);
      setProgress(p);
      if (p >= 1) {
        cancel();
        onTrigger();
      }
    }, 40);
  }
  function cancel() {
    if (timer.current) clearInterval(timer.current);
    timer.current = undefined;
    setProgress(0);
  }
  useEffect(() => cancel, []);

  const size = compact ? 92 : 132;
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <button
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onContextMenu={(e) => e.preventDefault()}
        className="relative grid touch-none select-none place-items-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-500/40 animate-sos-pulse"
        style={{ width: size, height: size }}
        aria-label="Mantén presionado para activar emergencia SOS"
      >
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.25)" strokeWidth="5" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="white"
            strokeWidth="5"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>
        <div className="flex flex-col items-center">
          <Siren className={compact ? "h-7 w-7" : "h-10 w-10"} />
          <span className={cn("font-display font-black tracking-wider", compact ? "text-sm" : "text-lg")}>SOS</span>
        </div>
      </button>
      <span className="mt-2 text-[11px] font-semibold text-red-700">Mantén presionado para EMERGENCIA</span>
    </div>
  );
}

const STEPS = [
  { at: 0, icon: ShieldAlert, title: "Alerta SOS activada", done: "GPS y contexto del servicio capturados" },
  { at: 1500, icon: Phone, title: "Llamando a Línea de Emergencias 123", done: "Conectado · operador informado (00:42)" },
  { at: 4500, icon: PhoneMissed, title: `Llamando a ${PARENT.name} (madre)`, done: "No contesta · activando plan de contingencia" },
  { at: 8000, icon: MessageCircle, title: "WhatsApp prioritario a los padres", done: "Nota de voz + enlace GPS en vivo entregados ✓✓" },
  { at: 10500, icon: Truck, title: "Torre de control notificada", done: "" },
];

export function SosProtocolDialog({ alert, onClose }: { alert: SosAlert | undefined; onClose: () => void }) {
  const now = useNow(400);
  const open = !!alert;
  const elapsed = alert ? now - alert.at : 0;
  const current = STEPS.reduce((acc, s, i) => (elapsed >= s.at ? i : acc), 0);
  const callSecs = Math.max(0, Math.floor((elapsed - 1500) / 1000));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && alert?.status === "resuelta" && onClose()}>
      <DialogContent hideClose overlayClassName="bg-red-950/70" className="max-w-md border-red-500">
        {alert && (
          <div className="scrollbar-thin overflow-y-auto">
            <div className={cn("p-5 text-white", alert.status === "resuelta" ? "bg-mint" : "bg-gradient-to-br from-red-600 to-red-700")}>
              <div className="flex items-center gap-3">
                <div className={cn("grid h-14 w-14 place-items-center rounded-full bg-white/20", alert.status !== "resuelta" && "animate-sos-pulse")}>
                  {alert.status === "resuelta" ? <CheckCircle2 className="h-8 w-8" /> : <Siren className="h-8 w-8" />}
                </div>
                <div>
                  <DialogTitle className="text-white">
                    {alert.status === "resuelta" ? "Emergencia resuelta" : "PROTOCOLO DE EMERGENCIA"}
                  </DialogTitle>
                  <DialogDescription className="text-white/80">
                    {alert.status === "resuelta" ? "La agencia cerró la alerta." : `Activo hace ${Math.floor(elapsed / 1000)} s · mantén la calma`}
                  </DialogDescription>
                </div>
              </div>
              {alert.status !== "resuelta" && current >= 1 && current <= 2 && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Phone className="h-4 w-4 animate-pulse" /> {current === 1 ? "Llamada a 123 en curso" : "Marcando a los padres…"}
                  </div>
                  <span className="font-mono text-sm">00:{String(callSecs % 60).padStart(2, "0")}</span>
                </div>
              )}
            </div>

            <ol className="space-y-1 p-5">
              {STEPS.map((s, i) => {
                const reached = i <= current || alert.status === "resuelta";
                const finished = i < current || alert.status === "resuelta";
                const isTower = i === STEPS.length - 1;
                const towerText =
                  alert.status === "activa"
                    ? "Esperando que un operador tome la alerta…"
                    : alert.status === "atendida"
                    ? "Operador atendiendo · unidad de apoyo en camino (ETA 6 min)"
                    : "Alerta cerrada por la agencia";
                return (
                  <li key={s.title} className={cn("flex gap-3 rounded-xl p-2.5 transition", reached ? "opacity-100" : "opacity-35", i === current && alert.status !== "resuelta" && "bg-red-50")}>
                    <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", finished || (isTower && alert.status !== "activa") ? "bg-mint text-white" : reached ? "bg-red-600 text-white" : "bg-muted text-muted-foreground")}>
                      {finished && !isTower ? <CheckCheck className="h-4 w-4" /> : reached && !(isTower && alert.status !== "activa") ? <Loader2 className="h-4 w-4 animate-spin" /> : <s.icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{reached ? (isTower ? towerText : finished ? s.done : "En proceso…") : "Pendiente"}</div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {current >= 3 && (
              <div className="mx-5 mb-4 rounded-2xl bg-whatsapp-bg p-3">
                <div className="mb-2 text-[11px] font-semibold text-whatsapp-dark">Vista previa · WhatsApp enviado a {PARENT.name}</div>
                <div className="space-y-1.5 rounded-xl bg-white p-3 text-xs shadow-sm">
                  <div className="font-bold text-red-600">🚨 ALERTA SOS · Mi Casa Niñera</div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                    <Mic className="h-4 w-4 text-whatsapp-dark" />
                    <div className="h-1.5 flex-1 rounded-full bg-whatsapp/40" />
                    <span>0:18</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <MapPin className="h-3.5 w-3.5" /> maps.google.com/?q={alert.position[0].toFixed(5)},{alert.position[1].toFixed(5)}
                  </div>
                </div>
              </div>
            )}

            <div className="mx-5 mb-5 flex items-center gap-2 rounded-xl border p-3 text-xs">
              <MapPin className="h-4 w-4 text-red-600" />
              GPS: {alert.position[0].toFixed(5)}, {alert.position[1].toFixed(5)} · compartiendo en vivo
            </div>

            <div className="flex gap-2 border-t bg-muted/40 p-4">
              {alert.status === "resuelta" ? (
                <Button className="w-full" onClick={onClose}>Volver al servicio</Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => actions.resolveSOS(alert.id)}>
                  Cancelar alerta (falsa alarma)
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
