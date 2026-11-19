"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Baby, CalendarCheck, Check, Clock, Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Textarea, Label } from "@/components/ui/input";
import { SERVICE_TYPES, type Caregiver } from "@/lib/data";
import { actions, useDemo } from "@/lib/store";
import { cn, formatCOP } from "@/lib/utils";

const DATES = ["Hoy", "Mañana", "Sábado", "Domingo"];
const TIMES = ["8:00 a.m.", "2:00 p.m.", "3:00 p.m.", "4:30 p.m.", "6:00 p.m.", "8:00 p.m."];

export function BookingDialog({ caregiver, onClose, source }: { caregiver: Caregiver | null; onClose: () => void; source: "app" | "whatsapp" }) {
  const router = useRouter();
  const { child } = useDemo();
  const [type, setType] = useState<string>(SERVICE_TYPES[0].id);
  const [date, setDate] = useState(DATES[0]);
  const [time, setTime] = useState(TIMES[2]);
  const [hours, setHours] = useState(3);
  const [notes, setNotes] = useState("");
  const c = caregiver;
  const st = SERVICE_TYPES.find((s) => s.id === type)!;
  const rate = c ? Math.max(c.hourlyRate, st.id === "tutoria" ? 40000 : c.hourlyRate) : 0;

  function confirm() {
    if (!c) return;
    actions.bookService({
      caregiverId: c.id,
      typeLabel: st.label,
      hours,
      rate,
      date,
      startTime: time,
      notes: notes || undefined,
      source,
    });
    onClose();
    router.push("/padres/servicio");
  }

  return (
    <Dialog open={!!c} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {c && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 pr-10">
                <Avatar src={c.photo} name={c.name} className="h-12 w-12" />
                <div>
                  <DialogTitle className="text-lg">Reservar con {c.name.split(" ")[0]}</DialogTitle>
                  <DialogDescription>{c.title}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="scrollbar-thin space-y-5 overflow-y-auto px-6 pb-4">
              <div className="space-y-2">
                <Label>Tipo de servicio</Label>
                <div className="grid gap-2">
                  {SERVICE_TYPES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setType(s.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3 text-left transition",
                        type === s.id ? "border-primary bg-secondary ring-1 ring-primary" : "hover:bg-muted"
                      )}
                    >
                      <div>
                        <div className="text-sm font-semibold">{s.label}</div>
                        <div className="text-xs text-muted-foreground">{s.desc}</div>
                      </div>
                      {type === s.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fecha</Label>
                <div className="flex gap-2 overflow-x-auto">
                  {DATES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDate(d)}
                      className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", date === d ? "border-primary bg-primary text-white" : "bg-white")}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora de inicio</Label>
                  <select
                    id="hora"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm shadow-sm"
                  >
                    {TIMES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Duración</Label>
                  <div className="flex h-11 items-center justify-between rounded-xl border bg-white px-1.5 shadow-sm">
                    <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted" onClick={() => setHours((h) => Math.max(2, h - 1))} aria-label="Menos horas">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {hours} h
                    </span>
                    <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted" onClick={() => setHours((h) => Math.min(10, h + 1))} aria-label="Más horas">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Indicaciones para este turno</Label>
                <Textarea id="notas" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: hoy tiene tarea de sumas y le duele un poco la garganta." className="min-h-[70px]" />
              </div>

              <Link href="/padres/nino" onClick={onClose} className="flex items-center gap-3 rounded-2xl border border-mint/30 bg-mint-soft p-3 text-sm">
                <Baby className="h-5 w-5 text-mint-foreground" />
                <span className="flex-1">
                  Se compartirá la ficha de <strong>{child.name}</strong> ({child.age} años) con alergias y rutinas.
                </span>
                <span className="text-xs font-semibold text-mint-foreground">Editar</span>
              </Link>

              <div className="space-y-1.5 rounded-2xl bg-muted/60 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{st.label} · {hours} h × {formatCOP(rate)}</span>
                  <span className="font-semibold">{formatCOP(hours * rate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seguro de servicio + SOS</span>
                  <span className="font-semibold text-mint-foreground">Incluido</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-display font-black text-navy">{formatCOP(hours * rate)}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button size="lg" className="w-full" onClick={confirm}>
                <CalendarCheck /> Confirmar reserva · {date} {time}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
