"use client";

import { Award, BadgeCheck, Briefcase, CalendarCheck, Globe, MapPin, Play, ShieldCheck, Star, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/avatar";
import type { Caregiver } from "@/lib/data";
import { formatCOP } from "@/lib/utils";
import { kmFromHome } from "@/lib/matchmaking";

export function Stars({ value, className = "h-3.5 w-3.5" }: { value: number; className?: string }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${className} ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
      ))}
    </div>
  );
}

export function CaregiverProfileDialog({
  caregiver,
  busy,
  match,
  onClose,
  onBook,
}: {
  caregiver: Caregiver | null;
  busy: boolean;
  match?: number;
  onClose: () => void;
  onBook: (c: Caregiver) => void;
}) {
  const c = caregiver;
  return (
    <Dialog open={!!c} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {c && (
          <>
            <div className="scrollbar-thin overflow-y-auto">
              <div className="relative h-56 bg-secondary">
                <SafeImage src={c.photo.replace("w=400&h=400", "w=800&h=600")} alt={c.name} className="h-full w-full object-[center_25%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className="bg-white/95 text-primary">
                      <BadgeCheck /> Verificado
                    </Badge>
                    {match && <Badge className="bg-mint text-white">{match}% compatible</Badge>}
                    <Badge className={busy ? "bg-warm text-white" : "bg-whatsapp text-white"}>{busy ? "En servicio" : "Disponible hoy"}</Badge>
                  </div>
                  <DialogTitle className="mt-2 text-2xl text-white">{c.name}</DialogTitle>
                  <DialogDescription className="text-white/80">{c.title}</DialogDescription>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x border-b text-center">
                <div className="py-3">
                  <div className="flex items-center justify-center gap-1 font-display text-lg font-black text-navy">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {c.rating}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{c.reviewsCount} reseñas</div>
                </div>
                <div className="py-3">
                  <div className="font-display text-lg font-black text-navy">{c.years} años</div>
                  <div className="text-[11px] text-muted-foreground">experiencia</div>
                </div>
                <div className="py-3">
                  <div className="font-display text-lg font-black text-navy">{c.services}</div>
                  <div className="text-[11px] text-muted-foreground">servicios</div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">{c.bio}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-2.5">
                    <MapPin className="h-4 w-4 text-primary" /> {c.zone} · {kmFromHome(c).toFixed(1)} km
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-2.5">
                    <Users className="h-4 w-4 text-primary" /> {c.ageRange}
                  </div>
                  <div className="col-span-2 flex items-center gap-2 rounded-xl bg-muted/60 p-2.5">
                    <Globe className="h-4 w-4 text-primary" /> {c.languages.join(" · ")}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-bold text-navy">Especialidades</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.specialties.map((s) => (
                      <Badge key={s} variant="mint">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-bold text-navy">Video de presentación</div>
                  <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-mint">
                    <SafeImage src={c.photo} alt="" className="absolute inset-0 h-full w-full opacity-40 blur-[2px]" />
                    <button className="relative grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary shadow-lg transition hover:scale-105" aria-label="Reproducir video">
                      <Play className="ml-1 h-6 w-6 fill-primary" />
                    </button>
                    <span className="absolute bottom-2 right-3 rounded-md bg-black/50 px-1.5 text-[11px] font-semibold text-white">1:12</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-bold text-navy">Certificaciones verificadas</div>
                  <ul className="space-y-2">
                    {c.certifications.map((cert) => (
                      <li key={cert} className="flex items-center gap-2 text-sm">
                        {cert.toLowerCase().includes("antecedentes") ? (
                          <ShieldCheck className="h-4 w-4 shrink-0 text-mint" />
                        ) : cert.toLowerCase().includes("lic") || cert.includes("–") ? (
                          <Award className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-bold text-navy">
                    Reseñas de familias <span className="text-xs font-semibold text-muted-foreground">{c.reviewsCount} en total</span>
                  </div>
                  <div className="space-y-2.5">
                    {c.reviews.map((r) => (
                      <div key={r.author + r.date} className="rounded-2xl border p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{r.author}</span>
                          <span className="text-[11px] text-muted-foreground">{r.date}</span>
                        </div>
                        <Stars value={r.rating} />
                        <p className="mt-1.5 text-sm text-muted-foreground">“{r.text}”</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row items-center justify-between sm:justify-between">
              <div>
                <div className="font-display text-xl font-black text-navy">{formatCOP(c.hourlyRate)}</div>
                <div className="text-xs text-muted-foreground">por hora</div>
              </div>
              <Button size="lg" onClick={() => onBook(c)}>
                <CalendarCheck /> Reservar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
