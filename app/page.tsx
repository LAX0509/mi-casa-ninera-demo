import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  FileSignature,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Moon,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Siren,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, SafeImage } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/logo";
import { ChatWidget, OpenChatButton } from "@/components/landing/chat-widget";
import { CAREGIVERS, HERO_PHOTO } from "@/lib/data";
import { formatCOP } from "@/lib/utils";

const SERVICES = [
  {
    icon: HeartHandshake,
    title: "Cuidado Infantil",
    price: 28000,
    unit: "/hora",
    color: "from-primary/10 to-primary/0 text-primary",
    items: ["Licenciadas en educación infantil", "Actividades pedagógicas por edad", "Fotos y bitácora del día"],
  },
  {
    icon: BookOpen,
    title: "Tutoría Académica",
    price: 40000,
    unit: "/hora",
    color: "from-mint/15 to-mint/0 text-mint-foreground",
    items: ["Matemáticas, inglés y lectoescritura", "Plan pedagógico personalizado", "Informes de progreso académico"],
    featured: true,
  },
  {
    icon: Moon,
    title: "Plan Integral Mensual",
    price: 1190000,
    unit: "/mes",
    color: "from-warm/15 to-warm/0 text-orange-600",
    items: ["40 horas con cuidador(a) fijo(a)", "Diario de desarrollo infantil", "Prioridad en Backup Express"],
  },
];

const SECURITY = [
  { icon: BadgeCheck, title: "Perfiles verificados", text: "Antecedentes, licencias en educación y certificación en primeros auxilios." },
  { icon: MapPin, title: "GPS en vivo", text: "Sigue el recorrido del cuidador(a) y la geocerca de tu hogar en tiempo real." },
  { icon: QrCode, title: "Check-in OTP / QR", text: "El servicio solo inicia con el código que tú compartes. Horas transparentes." },
  { icon: Siren, title: "Protocolo SOS", text: "Llamada a emergencias, a ti y alerta crítica en nuestra torre de control." },
  { icon: FileSignature, title: "Pase de salida digital", text: "Checklist y firma al cierre: estado del niño y del hogar con respaldo legal." },
  { icon: RefreshCw, title: "Backup Express", text: "Si hay un imprevisto, reasignamos personal cercano automáticamente. 99.9%." },
];

const STEPS = [
  { icon: MessageCircle, title: "Escríbenos por WhatsApp", text: "Nuestra IA resuelve dudas y cotiza al instante, 24/7." },
  { icon: Sparkles, title: "Matchmaking inteligente", text: "Te sugerimos los 3 perfiles más compatibles y cercanos." },
  { icon: UserRoundCheck, title: "Ficha de tu hijo(a)", text: "Rutinas, alergias, gustos y normas de casa antes del turno." },
  { icon: Smartphone, title: "Sigue todo en vivo", text: "Mapa, chat, fotos y bitácora de cierre con recomendaciones." },
];

const PORTALS = [
  {
    href: "/padres",
    icon: Users,
    title: "App de Padres",
    text: "Explora perfiles, completa la ficha del niño, reserva y sigue el servicio en vivo.",
    tag: "Mobile-first",
    className: "from-primary to-sky-500",
  },
  {
    href: "/colaboradores",
    icon: Stethoscope,
    title: "App de Colaboradores",
    text: "Acepta turnos, haz check-in OTP/QR, activa el SOS y envía la bitácora de cierre.",
    tag: "Mobile-first",
    className: "from-mint to-emerald-500",
  },
  {
    href: "/admin",
    icon: LayoutDashboard,
    title: "Torre de Control",
    text: "Servicios en curso, personal disponible, ventas del día y alertas SOS en tiempo real.",
    tag: "Desktop",
    className: "from-navy to-primary",
  },
];

export default function LandingPage() {
  const featured = CAREGIVERS.slice(0, 4);
  return (
    <main className="overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#servicios" className="hover:text-foreground">Servicios</a>
            <a href="#seguridad" className="hover:text-foreground">Seguridad</a>
            <a href="#como-funciona" className="hover:text-foreground">Cómo funciona</a>
            <a href="#demo" className="hover:text-foreground">Demo</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/admin">Agencia</Link>
            </Button>
            <Button asChild>
              <Link href="/padres">Reservar <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-hero relative">
        <div className="container grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Badge variant="mint" className="mb-5 px-3 py-1 text-[13px]">
              <ShieldCheck /> 100% personal verificado en Medellín
            </Badge>
            <h1 className="text-4xl font-black leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
              Cuidado y tutoría infantil con la{" "}
              <span className="bg-gradient-to-r from-primary to-mint bg-clip-text text-transparent">tranquilidad de verlo en vivo</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Niñeras licenciadas y tutores académicos verificados. Rastreo GPS, check-in con código OTP, chat con fotos y un
              protocolo SOS conectado a nuestra torre de control.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/padres">
                  <CalendarCheck className="!size-5" /> Reservar ahora
                </Link>
              </Button>
              <OpenChatButton className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-whatsapp px-7 text-base font-semibold text-white shadow-sm transition hover:bg-whatsapp/90">
                <MessageCircle className="h-5 w-5" /> Hablar por WhatsApp
              </OpenChatButton>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                {featured.map((c) => (
                  <Avatar key={c.id} src={c.photo} name={c.name} className="h-10 w-10 ring-2 ring-white" />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 font-bold text-navy">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5 · +1.200 familias
                </div>
                <div className="text-muted-foreground">El Poblado · Laureles · Envigado · Sabaneta</div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-2 shadow-soft">
              <SafeImage src={HERO_PHOTO} alt="Niños jugando con su cuidadora" className="aspect-[4/4.2] w-full rounded-[1.6rem]" />
            </div>
            <div className="absolute -left-4 top-8 flex animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-soft sm:-left-10">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint-soft text-mint-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-navy">Check-in OTP verificado</div>
                <div className="text-muted-foreground">Valentina · 3:02 p.m.</div>
              </div>
            </div>
            <div className="absolute -right-3 bottom-24 flex animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-soft [animation-delay:1.2s] sm:-right-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-navy">En el parque · 120 m de casa</div>
                <div className="text-muted-foreground">GPS en vivo</div>
              </div>
            </div>
            <div className="absolute -bottom-5 left-6 flex items-center gap-2 rounded-2xl bg-navy px-4 py-3 text-xs font-semibold text-white shadow-soft">
              <Brain className="h-4 w-4 text-mint" /> Sofía completó 12 retos de sumas hoy 🎉
            </div>
          </div>
        </div>

        <div className="container pb-14">
          <div className="grid grid-cols-2 gap-3 rounded-3xl border bg-white/70 p-5 backdrop-blur md:grid-cols-4">
            {[
              ["+35%", "conversión con IA en WhatsApp"],
              ["99.9%", "garantía Backup Express"],
              ["< 2 min", "para reservar desde la app"],
              ["24/7", "torre de control y SOS"],
            ].map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="font-display text-2xl font-black text-primary md:text-3xl">{k}</div>
                <div className="text-xs font-medium text-muted-foreground md:text-sm">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Servicios y tarifas</Badge>
          <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">Más que horas de cuidado: desarrollo integral</h2>
          <p className="mt-3 text-muted-foreground">Precios transparentes, sin sorpresas. Mínimo 2 horas por servicio.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className={`relative overflow-hidden rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-soft ${s.featured ? "ring-2 ring-mint" : ""}`}
            >
              {s.featured && <Badge variant="mint" className="absolute right-5 top-5">Más pedido</Badge>}
              <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-navy">{s.title}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground">desde</span>
                <span className="font-display text-3xl font-black text-navy">{formatCOP(s.price)}</span>
                <span className="text-sm text-muted-foreground">{s.unit}</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {s.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> {i}
                  </li>
                ))}
              </ul>
              <Button asChild variant={s.featured ? "mint" : "outline"} className="mt-6 w-full">
                <Link href="/padres">Ver perfiles disponibles</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* SEGURIDAD */}
      <section id="seguridad" className="bg-navy py-20 text-white">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <Badge className="bg-white/10 text-mint">Plataforma de confianza</Badge>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Seguridad en cada minuto del servicio</h2>
              <p className="mt-4 text-white/70">
                Tecnología de blindaje operativo y legal: sabes quién entra a tu casa, a qué hora, dónde está tu hijo y qué hizo
                durante el día.
              </p>
              <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 animate-sos-pulse place-items-center rounded-full bg-red-500">
                    <Siren className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-bold">Protocolo de Emergencia SOS</div>
                    <div className="text-sm text-white/70">Llamada a emergencias + padres + WhatsApp con GPS en vivo</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {SECURITY.map((s) => (
                <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                  <s.icon className="h-6 w-6 text-mint" />
                  <div className="mt-3 font-bold">{s.title}</div>
                  <p className="mt-1 text-sm text-white/65">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="warm">Cómo funciona</Badge>
          <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">De WhatsApp a tu puerta en 4 pasos</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-3xl border bg-white p-6">
              <div className="absolute right-5 top-4 font-display text-5xl font-black text-muted">{i + 1}</div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 font-bold text-navy">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {featured.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl border bg-white p-4">
              <Avatar src={c.photo} name={c.name} className="h-14 w-14" />
              <div className="min-w-0">
                <div className="flex items-center gap-1 truncate font-bold text-navy">
                  {c.name} <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                </div>
                <div className="truncate text-xs text-muted-foreground">{c.title}</div>
                <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {c.rating} · {c.zone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="bg-hero border-t py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary">Demo interactivo</Badge>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">Explora el ecosistema completo</h2>
            <p className="mt-3 text-muted-foreground">
              💡 Tip: abre <strong>Colaboradores</strong> y <strong>Torre de Control</strong> en pestañas distintas y presiona el
              botón SOS para ver la alerta en tiempo real.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PORTALS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group relative overflow-hidden rounded-3xl bg-white p-1 shadow-sm ring-1 ring-border transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className={`rounded-[1.35rem] bg-gradient-to-br ${p.className} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <p.icon className="h-8 w-8" />
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{p.tag}</span>
                  </div>
                  <div className="mt-8 text-xl font-extrabold">{p.title}</div>
                  <div className="text-sm text-white/80">{p.href}</div>
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <p className="text-sm text-muted-foreground">{p.text}</p>
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <div>Medellín, Colombia · WhatsApp +57 300 555 0000</div>
          <div>© 2026 Mi Casa Niñera · Demo de plataforma</div>
        </div>
      </footer>

      <ChatWidget />
    </main>
  );
}
