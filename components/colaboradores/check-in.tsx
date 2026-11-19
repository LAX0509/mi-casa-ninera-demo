"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, QrCode, ScanLine } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { actions, type Service } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CheckInDialog({ service, open, onClose }: { service: Service; open: boolean; onClose: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ok, setOk] = useState<"OTP" | "QR" | null>(null);

  useEffect(() => {
    if (open) {
      setCode("");
      setError(false);
      setOk(null);
      setScanning(false);
    }
  }, [open]);

  function success(method: "OTP" | "QR") {
    setOk(method);
    setTimeout(() => {
      actions.checkIn(service.id, method);
      onClose();
    }, 1100);
  }

  function onCode(v: string) {
    const next = v.replace(/\D/g, "").slice(0, 4);
    setCode(next);
    setError(false);
    if (next.length === 4) {
      if (next === service.otp) success("OTP");
      else setError(true);
    }
  }

  function scan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      success("QR");
    }, 2200);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Check-in seguro</DialogTitle>
          <DialogDescription>Valida tu llegada con el código que te comparte {service.parentName.split(" ")[0]}.</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          {ok ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-mint-soft">
                <CheckCircle2 className="h-12 w-12 text-mint" />
              </div>
              <div className="mt-3 text-lg font-extrabold text-navy">Check-in verificado con {ok}</div>
              <div className="text-sm text-muted-foreground">Iniciando servicio y notificando a los padres…</div>
            </div>
          ) : (
            <Tabs defaultValue="otp">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="otp"><KeyRound className="h-4 w-4" /> Código OTP</TabsTrigger>
                <TabsTrigger value="qr"><QrCode className="h-4 w-4" /> Escanear QR</TabsTrigger>
              </TabsList>
              <TabsContent value="otp" className="pt-4">
                <label className="relative mx-auto flex w-fit cursor-text justify-center gap-2.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "grid h-16 w-14 place-items-center rounded-2xl border-2 font-display text-3xl font-black transition",
                        i === code.length && "border-primary",
                        error && "border-red-500 text-red-600"
                      )}
                    >
                      {code[i] ?? ""}
                    </div>
                  ))}
                  <input
                    value={code}
                    autoFocus
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    onChange={(e) => onCode(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-text opacity-0"
                    aria-label="Código OTP de 4 dígitos"
                  />
                </label>
                <p className={cn("mt-3 text-center text-xs", error ? "font-semibold text-red-600" : "text-muted-foreground")}>
                  {error ? "Código incorrecto. Verifícalo con el padre/madre." : "El código aparece en la app de los padres."}
                </p>
                <p className="mt-4 rounded-xl bg-muted/60 p-2.5 text-center text-[11px] text-muted-foreground">
                  Demo: el código de este servicio es <strong className="text-foreground">{service.otp}</strong>
                </p>
              </TabsContent>
              <TabsContent value="qr" className="pt-4">
                <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-3xl bg-navy">
                  <div className="absolute inset-6 rounded-2xl border-2 border-white/40" />
                  {[
                    "left-4 top-4 border-l-4 border-t-4",
                    "right-4 top-4 border-r-4 border-t-4",
                    "bottom-4 left-4 border-b-4 border-l-4",
                    "bottom-4 right-4 border-b-4 border-r-4",
                  ].map((c) => (
                    <span key={c} className={cn("absolute h-8 w-8 rounded-sm border-mint", c)} />
                  ))}
                  {scanning && <div className="absolute inset-x-6 h-0.5 animate-scan bg-mint shadow-[0_0_12px_2px] shadow-mint" />}
                  <div className="absolute inset-0 grid place-items-center text-white/60">
                    <ScanLine className="h-12 w-12" />
                  </div>
                </div>
                <Button className="mt-4 w-full" onClick={scan} disabled={scanning}>
                  {scanning ? "Escaneando…" : "Simular escaneo de QR"}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
