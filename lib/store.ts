"use client";

/**
 * Store de demo "tiempo real" sin backend:
 * - Persiste en localStorage.
 * - Sincroniza entre pestañas con el evento `storage` (abre /colaboradores y /admin
 *   en pestañas distintas y el SOS se refleja al instante).
 * Para producción, reemplazar `commit()` por escrituras a Supabase y el listener
 * de `storage` por un canal `supabase.channel(...).on("postgres_changes", ...)`.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  CAREGIVERS,
  DEFAULT_CHILD,
  EXTERNAL_SERVICES,
  PARENT,
  getCaregiver,
  type ChildProfile,
  type LatLng,
} from "./data";
import { LOOP_MS, TRAVEL_MS, along, distanceMeters, parkLoop, routeBetween } from "./geo";
import { uid } from "./utils";

export type ServiceStatus = "pendiente" | "aceptado" | "en_curso" | "finalizado";

export interface ClosingLog {
  activities: string[];
  food: string;
  homework: string;
  mood: string;
  observations: string;
  recommendations: string;
  checklist: string[];
  signature?: string;
  at: number;
}

export interface Service {
  id: string;
  caregiverId: string;
  parentName: string;
  childName: string;
  childAge: number;
  typeLabel: string;
  hours: number;
  rate: number;
  total: number;
  date: string;
  startTime: string;
  address: string;
  home: LatLng;
  otp: string;
  status: ServiceStatus;
  notes?: string;
  source: "app" | "whatsapp" | "admin";
  createdAt: number;
  acceptedAt?: number;
  arrivedAt?: number;
  checkInAt?: number;
  checkInMethod?: "OTP" | "QR";
  finishedAt?: number;
  log?: ClosingLog;
  backupFrom?: string;
}

export interface Message {
  id: string;
  serviceId: string;
  from: "padre" | "colaborador" | "sistema";
  text: string;
  image?: string;
  video?: boolean;
  at: number;
}

export interface SosAlert {
  id: string;
  serviceId: string;
  caregiverId: string;
  position: LatLng;
  at: number;
  status: "activa" | "atendida" | "resuelta";
  attendedAt?: number;
  resolvedAt?: number;
}

export interface Lead {
  id: string;
  name: string;
  interest: string;
  at: number;
  status: "nuevo" | "en_reserva" | "convertido";
}

export interface ActivityItem {
  id: string;
  at: number;
  kind: "info" | "success" | "warning" | "danger";
  text: string;
}

export interface DemoState {
  version: number;
  child: ChildProfile;
  childSaved: boolean;
  services: Service[];
  messages: Message[];
  sos: SosAlert[];
  leads: Lead[];
  activity: ActivityItem[];
  currentCollaboratorId: string;
  salesBase: number;
}

const KEY = "mcn-demo-state";
const VERSION = 3;

function otp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function seed(now: number): DemoState {
  return {
    version: VERSION,
    child: DEFAULT_CHILD,
    childSaved: true,
    salesBase: EXTERNAL_SERVICES.reduce((a, s) => a + s.price, 0) + 412000,
    currentCollaboratorId: "c1",
    services: [
      {
        id: "s1",
        caregiverId: "c1",
        parentName: PARENT.name,
        childName: DEFAULT_CHILD.name,
        childAge: DEFAULT_CHILD.age,
        typeLabel: "Cuidado Infantil",
        hours: 4,
        rate: 32000,
        total: 128000,
        date: "Hoy",
        startTime: "3:00 p.m.",
        address: PARENT.address,
        home: PARENT.home,
        otp: "4821",
        status: "aceptado",
        source: "app",
        createdAt: now - 60 * 60 * 1000,
        acceptedAt: now - 45 * 1000,
      },
      {
        id: "s2",
        caregiverId: "c1",
        parentName: "Familia Mejía",
        childName: "Tomás",
        childAge: 8,
        typeLabel: "Tutoría Académica",
        hours: 2,
        rate: 40000,
        total: 80000,
        date: "Mañana",
        startTime: "4:30 p.m.",
        address: "Cl. 10 #32-15, El Poblado",
        home: [6.2065, -75.566],
        otp: otp(),
        status: "pendiente",
        notes: "Refuerzo de fracciones para examen del viernes.",
        source: "whatsapp",
        createdAt: now - 6 * 60 * 1000,
      },
    ],
    messages: [
      { id: "m0", serviceId: "s1", from: "sistema", text: "Valentina aceptó tu servicio y va en camino 🚗", at: now - 45 * 1000 },
      { id: "m1", serviceId: "s1", from: "colaborador", text: "¡Hola Laura! Ya voy saliendo, llego en pocos minutos 😊", at: now - 40 * 1000 },
    ],
    sos: [],
    leads: [
      { id: "l1", name: "Paula Echeverri", interest: "Tutoría de matemáticas para 5º grado", at: now - 32 * 60 * 1000, status: "convertido" },
      { id: "l2", name: "Ricardo Gil", interest: "Niñera nocturna sábado (2 niños)", at: now - 18 * 60 * 1000, status: "en_reserva" },
      { id: "l3", name: "Ana María Toro", interest: "Precios plan mensual", at: now - 7 * 60 * 1000, status: "nuevo" },
    ],
    activity: [
      { id: "a1", at: now - 6 * 60 * 1000, kind: "info", text: "Nueva solicitud vía WhatsApp: Familia Mejía (Tutoría)" },
      { id: "a2", at: now - 20 * 60 * 1000, kind: "success", text: "Santiago Vélez hizo check-in con QR · Familia Posada" },
      { id: "a3", at: now - 40 * 60 * 1000, kind: "success", text: "Andrés Montoya hizo check-in con OTP · Familia Henao" },
      { id: "a4", at: now - 75 * 60 * 1000, kind: "warning", text: "Backup Express: reasignado turno de Familia Uribe a Camila Restrepo" },
    ],
  };
}

let state: DemoState | null = null;
const serverState = seed(0);
const listeners = new Set<() => void>();

function load(): DemoState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.version === VERSION) return parsed;
    }
  } catch {
    /* ignorar */
  }
  const fresh = seed(Date.now());
  persist(fresh);
  return fresh;
}

function persist(s: DemoState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* sin almacenamiento: la demo sigue funcionando en memoria */
  }
}

let wired = false;
function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try {
      state = e.newValue ? (JSON.parse(e.newValue) as DemoState) : seed(Date.now());
    } catch {
      return;
    }
    listeners.forEach((l) => l());
  });
}

export function getState(): DemoState {
  if (typeof window === "undefined") return serverState;
  if (!state) state = load();
  return state;
}

function commit(updater: (s: DemoState) => DemoState) {
  state = updater(getState());
  persist(state);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  wire();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, getState, () => serverState);
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/* ----------------------------- Selectores ----------------------------- */

export const BUSY_EXTERNAL = new Set(EXTERNAL_SERVICES.map((s) => s.caregiverId));

export function isBusy(s: DemoState, caregiverId: string) {
  return (
    BUSY_EXTERNAL.has(caregiverId) ||
    s.services.some((x) => x.caregiverId === caregiverId && (x.status === "en_curso" || x.status === "aceptado"))
  );
}

export function caregiverPosition(service: Service, now: number): LatLng {
  const cg = getCaregiver(service.caregiverId);
  if (service.status === "pendiente") return cg.base;
  if (service.status === "aceptado") {
    if (service.arrivedAt) return service.home;
    const t = (now - (service.acceptedAt ?? now)) / TRAVEL_MS;
    return along(routeBetween(cg.base, service.home), t);
  }
  if (service.status === "en_curso") {
    const t = ((now - (service.checkInAt ?? now)) % LOOP_MS) / LOOP_MS;
    return along(parkLoop(service.home), t);
  }
  return service.home;
}

export function etaMinutes(service: Service, now: number) {
  if (service.status !== "aceptado" || service.arrivedAt) return 0;
  const left = TRAVEL_MS - (now - (service.acceptedAt ?? now));
  return Math.max(0, Math.ceil(left / 60000));
}

export function hasArrived(service: Service, now: number) {
  return distanceMeters(caregiverPosition(service, now), service.home) < 150;
}

export function activeSos(s: DemoState) {
  return s.sos.find((a) => a.status !== "resuelta");
}

export function salesToday(s: DemoState) {
  return s.salesBase + s.services.filter((x) => x.status === "en_curso" || x.status === "finalizado").reduce((a, x) => a + x.total, 0);
}

/* ------------------------------ Acciones ------------------------------ */

function log(s: DemoState, kind: ActivityItem["kind"], text: string): ActivityItem[] {
  return [{ id: uid("a"), at: Date.now(), kind, text }, ...s.activity].slice(0, 40);
}

function patchService(s: DemoState, id: string, patch: Partial<Service>): Service[] {
  return s.services.map((x) => (x.id === id ? { ...x, ...patch } : x));
}

function sysMsg(serviceId: string, text: string): Message {
  return { id: uid("m"), serviceId, from: "sistema", text, at: Date.now() };
}

export const actions = {
  reset() {
    commit(() => seed(Date.now()));
  },

  saveChild(child: ChildProfile) {
    commit((s) => ({
      ...s,
      child,
      childSaved: true,
      services: s.services.map((x) =>
        x.parentName === PARENT.name ? { ...x, childName: child.name, childAge: child.age } : x
      ),
      activity: log(s, "info", `${PARENT.name} actualizó la ficha de ${child.name}`),
    }));
  },

  bookService(input: {
    caregiverId: string;
    typeLabel: string;
    hours: number;
    rate: number;
    date: string;
    startTime: string;
    notes?: string;
    source?: Service["source"];
  }) {
    const id = uid("s");
    commit((s) => {
      const cg = getCaregiver(input.caregiverId);
      const service: Service = {
        id,
        caregiverId: input.caregiverId,
        parentName: PARENT.name,
        childName: s.child.name,
        childAge: s.child.age,
        typeLabel: input.typeLabel,
        hours: input.hours,
        rate: input.rate,
        total: input.hours * input.rate,
        date: input.date,
        startTime: input.startTime,
        address: PARENT.address,
        home: PARENT.home,
        otp: otp(),
        status: "pendiente",
        notes: input.notes,
        source: input.source ?? "app",
        createdAt: Date.now(),
      };
      const leads =
        input.source === "whatsapp"
          ? s.leads.map((l, i) => (i === 0 && l.status !== "convertido" ? { ...l, status: "convertido" as const } : l))
          : s.leads;
      return {
        ...s,
        leads,
        currentCollaboratorId: input.caregiverId,
        services: [service, ...s.services],
        messages: [...s.messages, sysMsg(id, `Solicitud enviada a ${cg.name}. Te avisaremos cuando la acepte.`)],
        activity: log(s, "info", `Nueva reserva: ${PARENT.name} → ${cg.name} (${input.typeLabel}, ${input.hours} h)`),
      };
    });
    return id;
  },

  acceptService(id: string) {
    commit((s) => {
      const sv = s.services.find((x) => x.id === id);
      if (!sv) return s;
      const cg = getCaregiver(sv.caregiverId);
      return {
        ...s,
        services: patchService(s, id, { status: "aceptado", acceptedAt: Date.now(), arrivedAt: undefined }),
        messages: [...s.messages, sysMsg(id, `${cg.name} aceptó el servicio y va en camino 🚗`)],
        activity: log(s, "success", `${cg.name} aceptó el servicio de ${sv.parentName}`),
      };
    });
  },

  declineService(id: string) {
    actions.backupExpress(id, "Rechazo del colaborador");
  },

  arrive(id: string) {
    commit((s) => ({
      ...s,
      services: patchService(s, id, { arrivedAt: Date.now() }),
      messages: [...s.messages, sysMsg(id, "📍 Tu cuidador(a) llegó a la geocerca de tu hogar.")],
    }));
  },

  checkIn(id: string, method: "OTP" | "QR") {
    commit((s) => {
      const sv = s.services.find((x) => x.id === id);
      if (!sv) return s;
      const cg = getCaregiver(sv.caregiverId);
      const time = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      return {
        ...s,
        services: patchService(s, id, { status: "en_curso", checkInAt: Date.now(), checkInMethod: method, arrivedAt: sv.arrivedAt ?? Date.now() }),
        messages: [...s.messages, sysMsg(id, `✅ ${cg.name} hizo check-in con ${method} a las ${time}. ¡El servicio comenzó!`)],
        activity: log(s, "success", `${cg.name} hizo check-in con ${method} · ${sv.parentName}`),
      };
    });
  },

  finishService(id: string, closing: Omit<ClosingLog, "at">) {
    commit((s) => {
      const sv = s.services.find((x) => x.id === id);
      if (!sv) return s;
      const cg = getCaregiver(sv.caregiverId);
      return {
        ...s,
        services: patchService(s, id, { status: "finalizado", finishedAt: Date.now(), log: { ...closing, at: Date.now() } }),
        messages: [...s.messages, sysMsg(id, `📝 ${cg.name} finalizó el servicio y envió la bitácora con recomendaciones.`)],
        activity: log(s, "success", `Servicio finalizado con pase de salida firmado · ${sv.parentName}`),
      };
    });
  },

  sendMessage(serviceId: string, from: Message["from"], text: string, extra?: { image?: string; video?: boolean }) {
    commit((s) => ({
      ...s,
      messages: [...s.messages, { id: uid("m"), serviceId, from, text, at: Date.now(), ...extra }],
    }));
  },

  triggerSOS(serviceId: string, caregiverId: string, position: LatLng) {
    const id = uid("sos");
    commit((s) => {
      const cg = getCaregiver(caregiverId);
      return {
        ...s,
        sos: [{ id, serviceId, caregiverId, position, at: Date.now(), status: "activa" }, ...s.sos],
        messages: [...s.messages, sysMsg(serviceId, `🚨 ${cg.name} activó el protocolo de EMERGENCIA SOS. La agencia está coordinando la atención.`)],
        activity: log(s, "danger", `ALERTA SOS activada por ${cg.name}`),
      };
    });
    return id;
  },

  attendSOS(id: string) {
    commit((s) => ({
      ...s,
      sos: s.sos.map((a) => (a.id === id ? { ...a, status: "atendida", attendedAt: Date.now() } : a)),
      activity: log(s, "warning", "Torre de control atendiendo alerta SOS · Unidad de apoyo despachada"),
    }));
  },

  resolveSOS(id: string) {
    commit((s) => {
      const a = s.sos.find((x) => x.id === id);
      return {
        ...s,
        sos: s.sos.map((x) => (x.id === id ? { ...x, status: "resuelta", resolvedAt: Date.now() } : x)),
        messages: a ? [...s.messages, sysMsg(a.serviceId, "✅ La alerta SOS fue resuelta por la agencia. Todo está bajo control.")] : s.messages,
        activity: log(s, "success", "Alerta SOS marcada como resuelta"),
      };
    });
  },

  addLead(interest: string) {
    const names = ["Visitante WhatsApp", "Juliana Herrera", "Carlos Ramírez", "Melissa Duque", "Tatiana Mesa"];
    commit((s) => ({
      ...s,
      leads: [
        { id: uid("l"), name: names[Math.floor(Math.random() * names.length)], interest, at: Date.now(), status: "en_reserva" },
        ...s.leads,
      ],
      activity: log(s, "info", `Nuevo prospecto desde el Agente IA de WhatsApp: "${interest}"`),
    }));
  },

  setCollaborator(id: string) {
    commit((s) => ({ ...s, currentCollaboratorId: id }));
  },

  assign(serviceId: string, caregiverId: string) {
    commit((s) => {
      const sv = s.services.find((x) => x.id === serviceId);
      if (!sv) return s;
      const cg = getCaregiver(caregiverId);
      return {
        ...s,
        currentCollaboratorId: caregiverId,
        services: patchService(s, serviceId, { caregiverId, status: "aceptado", acceptedAt: Date.now(), arrivedAt: undefined }),
        messages: [...s.messages, sysMsg(serviceId, `La agencia asignó a ${cg.name} a tu servicio. Va en camino 🚗`)],
        activity: log(s, "success", `Asignación rápida: ${cg.name} → ${sv.parentName}`),
      };
    });
  },

  /** Algoritmo "Backup Express": reasigna al colaborador libre más cercano y compatible. */
  backupExpress(serviceId: string, reason = "Imprevisto del colaborador") {
    let chosen: string | null = null;
    commit((s) => {
      const sv = s.services.find((x) => x.id === serviceId);
      if (!sv) return s;
      const current = getCaregiver(sv.caregiverId);
      const candidates = CAREGIVERS.filter((c) => c.id !== sv.caregiverId && !isBusy(s, c.id))
        .map((c) => ({
          c,
          score:
            distanceMeters(c.base, sv.home) / 1000 -
            c.specialties.filter((sp) => current.specialties.includes(sp)).length * 2 -
            c.rating,
        }))
        .sort((a, b) => a.score - b.score);
      const next = candidates[0]?.c;
      if (!next) return s;
      chosen = next.name;
      return {
        ...s,
        currentCollaboratorId: next.id,
        services: patchService(s, serviceId, {
          caregiverId: next.id,
          backupFrom: current.name,
          status: sv.status === "pendiente" ? "pendiente" : "aceptado",
          acceptedAt: sv.status === "pendiente" ? undefined : Date.now(),
          arrivedAt: undefined,
          checkInAt: undefined,
        }),
        messages: [
          ...s.messages,
          sysMsg(serviceId, `🔄 Backup Express: ${current.name} tuvo un imprevisto. ${next.name} (★ ${next.rating}) tomó tu servicio.`),
        ],
        activity: log(s, "warning", `Backup Express (${reason}): ${current.name} → ${next.name} · ${sv.parentName}`),
      };
    });
    return chosen as string | null;
  },
};

/** Servicio más relevante para la familia demo (Laura). */
export function parentFocusService(s: DemoState): Service | undefined {
  const mine = s.services.filter((x) => x.parentName === PARENT.name);
  const order: ServiceStatus[] = ["en_curso", "aceptado", "pendiente"];
  for (const st of order) {
    const found = mine.find((x) => x.status === st);
    if (found) return found;
  }
  return mine.filter((x) => x.status === "finalizado").sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0];
}
