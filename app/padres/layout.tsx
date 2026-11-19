"use client";

import Link from "next/link";
import { Baby, Bell, Compass, Radio, Siren } from "lucide-react";
import { BackToHome, DemoAside, MobileShell } from "@/components/shared/mobile-shell";
import { Avatar } from "@/components/ui/avatar";
import { activeSos, parentFocusService, useDemo, useMounted } from "@/lib/store";
import { PARENT } from "@/lib/data";

export default function PadresLayout({ children }: { children: React.ReactNode }) {
  const state = useDemo();
  const mounted = useMounted();
  const focus = mounted ? parentFocusService(state) : undefined;
  const live = focus && (focus.status === "en_curso" || focus.status === "aceptado");
  const sos = mounted ? activeSos(state) : undefined;
  const sosMine = sos && focus && sos.serviceId === focus.id;

  return (
    <MobileShell
      aside={
        <DemoAside
          title="App de Padres"
          steps={[
            "Explora perfiles, filtra por especialidad y abre un perfil completo.",
            "Revisa o edita la ficha de tu hijo(a) en “Mi hijo”.",
            "Reserva y sigue el servicio en “En vivo”: mapa, OTP y chat con fotos.",
            "Acepta y haz check-in desde la App de Colaboradores para ver el cambio aquí.",
          ]}
          links={[
            { href: "/colaboradores", label: "Abrir App de Colaboradores" },
            { href: "/admin", label: "Abrir Torre de Control" },
          ]}
        />
      }
      header={
        <div className="flex items-center gap-2">
          <BackToHome />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-muted-foreground">Mi Casa Niñera · Padres</div>
            <div className="truncate font-display text-base font-extrabold text-navy">Hola, {PARENT.name.split(" ")[0]} 👋</div>
          </div>
          <button className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
            {live && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warm" />}
          </button>
          <Avatar name={PARENT.name} className="h-9 w-9 text-sm" />
        </div>
      }
      nav={[
        { href: "/padres", label: "Explorar", icon: Compass },
        { href: "/padres/nino", label: "Mi hijo", icon: Baby },
        { href: "/padres/servicio", label: "En vivo", icon: Radio, dot: !!live },
      ]}
    >
      {sosMine && (
        <Link
          href="/padres/servicio"
          className="flex animate-pulse items-center gap-3 bg-red-600 px-4 py-3 text-sm font-semibold text-white"
        >
          <Siren className="h-5 w-5 shrink-0" />
          Alerta SOS activa en tu servicio. La agencia está atendiendo. Toca para ver.
        </Link>
      )}
      {children}
    </MobileShell>
  );
}
