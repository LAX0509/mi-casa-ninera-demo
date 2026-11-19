"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Heart, Lightbulb, Phone, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PEDAGOGY_OPTIONS, type ChildProfile } from "@/lib/data";
import { actions, useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

const ALLERGY_CHIPS = ["Ninguna", "Maní", "Lácteos", "Gluten", "Huevo", "Picadura de abeja"];

function Section({ icon: Icon, title, hint, children, tone = "primary" }: { icon: typeof Heart; title: string; hint?: string; children: React.ReactNode; tone?: "primary" | "warm" | "mint" | "red" }) {
  const tones = {
    primary: "bg-secondary text-primary",
    warm: "bg-warm-soft text-orange-600",
    mint: "bg-mint-soft text-mint-foreground",
    red: "bg-red-50 text-red-600",
  };
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-navy">{title}</div>
          {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function FichaNino() {
  const { child } = useDemo();
  const [form, setForm] = useState<ChildProfile>(child);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ChildProfile>(k: K, v: ChildProfile[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const fields = [form.name, form.age, form.allergies, form.likes, form.routines, form.recommendations, form.emergencyContact, form.pedagogy.length];
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  function save() {
    actions.saveChild(form);
    setSaved(true);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl bg-gradient-to-br from-mint to-emerald-500 p-5 text-white shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-3xl">🧒</div>
          <div className="flex-1">
            <div className="text-xs text-white/80">Onboarding del niño</div>
            <div className="font-display text-xl font-black">Ficha de {form.name || "tu hijo(a)"}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Progress value={completion} className="h-2 bg-white/25" indicatorClassName="bg-white" />
          <span className="text-sm font-bold">{completion}%</span>
        </div>
        <p className="mt-2 text-xs text-white/85">El cuidador(a) lee esta ficha antes de aceptar el turno.</p>
      </div>

      <Section icon={Heart} title="Datos básicos">
        <div className="grid grid-cols-[1fr_90px] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age">Edad</Label>
            <Input id="age" type="number" min={0} max={17} value={form.age} onChange={(e) => set("age", Number(e.target.value))} />
          </div>
        </div>
      </Section>

      <Section icon={AlertTriangle} title="Alergias y salud" hint="Información crítica para el protocolo de emergencia" tone="red">
        <div className="flex flex-wrap gap-1.5">
          {ALLERGY_CHIPS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => set("allergies", a === "Ninguna" ? "Ninguna" : form.allergies && form.allergies !== "Ninguna" ? `${form.allergies}, ${a}` : a)}
              className="rounded-full border bg-white px-3 py-1 text-xs font-semibold hover:bg-muted"
            >
              + {a}
            </button>
          ))}
        </div>
        <Textarea value={form.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="Alergias, medicamentos, condiciones médicas…" className="min-h-[64px]" />
      </Section>

      <Section icon={Sparkles} title="Gustos e intereses" tone="warm">
        <Textarea value={form.likes} onChange={(e) => set("likes", e.target.value)} placeholder="Juegos, personajes, actividades favoritas…" className="min-h-[64px]" />
      </Section>

      <Section icon={Clock} title="Rutinas y normas de la casa" tone="primary">
        <Textarea value={form.routines} onChange={(e) => set("routines", e.target.value)} className="min-h-[64px]" />
      </Section>

      <Section icon={Lightbulb} title="Preferencias pedagógicas y recomendaciones" tone="mint">
        <div className="flex flex-wrap gap-1.5">
          {PEDAGOGY_OPTIONS.map((p) => {
            const on = form.pedagogy.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => set("pedagogy", on ? form.pedagogy.filter((x) => x !== p) : [...form.pedagogy, p])}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition",
                  on ? "border-mint bg-mint text-white" : "bg-white hover:bg-muted"
                )}
              >
                {on && <CheckCircle2 className="h-3.5 w-3.5" />} {p}
              </button>
            );
          })}
        </div>
        <Textarea value={form.recommendations} onChange={(e) => set("recommendations", e.target.value)} placeholder="Recomendaciones para el cuidador(a)…" className="min-h-[64px]" />
      </Section>

      <Section icon={Phone} title="Contacto de emergencia" tone="red">
        <Input value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} />
      </Section>

      <div className="sticky bottom-24 z-10 space-y-2">
        {saved && (
          <div className="flex items-center gap-2 rounded-xl bg-mint-soft px-3 py-2 text-sm font-semibold text-mint-foreground shadow-sm">
            <CheckCircle2 className="h-4 w-4" /> Ficha guardada y compartida con tu cuidador(a).
            <Link href="/padres" className="ml-auto text-xs underline">Ver matches</Link>
          </div>
        )}
        <Button size="lg" className="w-full shadow-soft" onClick={save}>
          <Save /> Guardar ficha
        </Button>
      </div>
    </div>
  );
}
