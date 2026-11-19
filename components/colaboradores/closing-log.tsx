"use client";

import { useState } from "react";
import { CheckCircle2, FileSignature, Send, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SignaturePad } from "./signature-pad";
import { actions, type Service } from "@/lib/store";
import { cn } from "@/lib/utils";

const ACTIVITIES = ["Juego guiado", "Lectura", "Tareas escolares", "Arte y pintura", "Parque", "Inglés", "Siesta", "Baño"];
const MOODS = ["😄 Feliz", "😌 Tranquilo(a)", "😴 Cansado(a)", "🥺 Sensible"];
const CHECKLIST = [
  "Niño(a) en buen estado de salud",
  "Entregado(a) a acudiente autorizado",
  "Hogar ordenado y seguro",
  "Llaves y pertenencias entregadas",
];

export function ClosingLogDialog({ service, open, onClose }: { service: Service; open: boolean; onClose: () => void }) {
  const [activities, setActivities] = useState<string[]>(["Juego guiado", "Tareas escolares"]);
  const [food, setFood] = useState("Merienda completa: fruta y yogur. Tomó suficiente agua.");
  const [homework, setHomework] = useState("Completó la guía de sumas (12/12) y lectura de 15 minutos.");
  const [mood, setMood] = useState(MOODS[0]);
  const [observations, setObservations] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [checks, setChecks] = useState<string[]>([]);
  const [signature, setSignature] = useState<string>();
  const [thinking, setThinking] = useState(false);

  const ready = checks.length === CHECKLIST.length && !!signature && recommendations.trim().length > 0;

  function suggest() {
    setThinking(true);
    setTimeout(() => {
      setRecommendations(
        `${service.childName} respondió muy bien al aprendizaje con juegos. Sugerimos 10 min diarios de retos de sumas con fichas y mantener la rutina de lectura antes de dormir. Reforzar hidratación en la tarde.`
      );
      setThinking(false);
    }, 900);
  }

  function submit() {
    actions.finishService(service.id, { activities, food, homework, mood, observations, recommendations, checklist: checks, signature });
    onClose();
  }

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bitácora de cierre</DialogTitle>
          <DialogDescription>
            Servicio de {service.childName} · se enviará a {service.parentName} con el pase de salida.
          </DialogDescription>
        </DialogHeader>
        <div className="scrollbar-thin space-y-5 overflow-y-auto px-6 pb-5">
          <div className="space-y-2">
            <Label>Actividades realizadas</Label>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggle(activities, setActivities, a)}
                  className={cn("rounded-full border px-3 py-1 text-xs font-semibold", activities.includes(a) ? "border-primary bg-primary text-white" : "bg-white")}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="food">Alimentación</Label>
            <Input id="food" value={food} onChange={(e) => setFood(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hw">Tareas completadas</Label>
            <Input id="hw" value={homework} onChange={(e) => setHomework(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Estado de ánimo</Label>
            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((m) => (
                <button key={m} type="button" onClick={() => setMood(m)} className={cn("rounded-xl border p-2 text-sm font-semibold", mood === m ? "border-mint bg-mint-soft text-mint-foreground" : "bg-white")}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="obs">Observaciones</Label>
            <Textarea id="obs" value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Algo que los padres deban saber…" className="min-h-[64px]" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="rec">Recomendaciones para los padres</Label>
              <button type="button" onClick={suggest} className="flex items-center gap-1 text-xs font-semibold text-mint-foreground">
                <Sparkles className={cn("h-3.5 w-3.5", thinking && "animate-spin")} /> {thinking ? "Generando…" : "Sugerir con IA"}
              </button>
            </div>
            <Textarea id="rec" value={recommendations} onChange={(e) => setRecommendations(e.target.value)} className="min-h-[80px]" />
          </div>
          <div className="space-y-2 rounded-2xl border p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-navy">
              <FileSignature className="h-4 w-4 text-primary" /> Pase de salida digital
            </div>
            {CHECKLIST.map((c) => (
              <label key={c} className="flex items-center gap-2.5 text-sm">
                <input type="checkbox" checked={checks.includes(c)} onChange={() => toggle(checks, setChecks, c)} className="h-4 w-4 accent-[hsl(var(--mint))]" />
                {c}
              </label>
            ))}
            <div className="pt-2">
              <SignaturePad onChange={setSignature} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex-1 text-xs text-muted-foreground sm:self-center">
            {ready ? (
              <span className="flex items-center gap-1 text-mint-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Lista para enviar</span>
            ) : (
              "Completa checklist, firma y recomendaciones"
            )}
          </div>
          <Button disabled={!ready} onClick={submit} size="lg">
            <Send /> Cerrar servicio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
