import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-mint shadow-sm", className)}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M12 17.5s-3.2-1.9-3.2-4a1.8 1.8 0 0 1 3.2-1.1 1.8 1.8 0 0 1 3.2 1.1c0 2.1-3.2 4-3.2 4Z" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export function Logo({ className, subtitle, href = "/" }: { className?: string; subtitle?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="font-display text-[15px] font-extrabold tracking-tight text-navy">Mi Casa Niñera</div>
        <div className="text-[11px] font-medium text-muted-foreground">{subtitle ?? "Cuidado & Tutoría Infantil"}</div>
      </div>
    </Link>
  );
}
