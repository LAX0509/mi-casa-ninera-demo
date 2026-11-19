import { Badge } from "@/components/ui/badge";
import type { ServiceStatus } from "@/lib/store";

const MAP: Record<ServiceStatus, { label: string; variant: "warm" | "secondary" | "mint" | "muted" }> = {
  pendiente: { label: "Pendiente", variant: "warm" },
  aceptado: { label: "En camino", variant: "secondary" },
  en_curso: { label: "En curso", variant: "mint" },
  finalizado: { label: "Finalizado", variant: "muted" },
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  const s = MAP[status];
  return (
    <Badge variant={s.variant}>
      {status === "en_curso" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />}
      {s.label}
    </Badge>
  );
}
