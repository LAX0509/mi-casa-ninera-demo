"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Send } from "lucide-react";
import { Avatar, SafeImage } from "@/components/ui/avatar";
import { actions, useDemo, type Message } from "@/lib/store";
import { cn, formatTime } from "@/lib/utils";

export interface QuickAction {
  label: string;
  onClick: () => void;
}

export function ServiceChat({
  serviceId,
  me,
  otherName,
  otherPhoto,
  quickActions = [],
  className,
  disabled,
}: {
  serviceId: string;
  me: "padre" | "colaborador";
  otherName: string;
  otherPhoto?: string;
  quickActions?: QuickAction[];
  className?: string;
  disabled?: boolean;
}) {
  const { messages } = useDemo();
  const list = messages.filter((m) => m.serviceId === serviceId);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [list.length]);

  function send() {
    const t = text.trim();
    if (!t) return;
    actions.sendMessage(serviceId, me, t);
    setText("");
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm", className)}>
      <div className="flex items-center gap-2.5 border-b px-3.5 py-2.5">
        <Avatar src={otherPhoto} name={otherName} className="h-8 w-8 text-xs" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">{otherName}</div>
          <div className="text-[10px] font-medium text-mint-foreground">● Chat seguro del servicio</div>
        </div>
      </div>
      <div ref={scroller} className="scrollbar-thin flex-1 space-y-2 overflow-y-auto bg-muted/30 p-3">
        {list.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">Aún no hay mensajes.</p>}
        {list.map((m) => (
          <Bubble key={m.id} m={m} mine={m.from === me} />
        ))}
      </div>
      {quickActions.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto border-t px-3 py-2">
          {quickActions.map((q) => (
            <button
              key={q.label}
              disabled={disabled}
              onClick={q.onClick}
              className="shrink-0 rounded-full border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/70 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t p-2"
      >
        <input
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="h-10 flex-1 rounded-full bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button type="submit" disabled={disabled} className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white disabled:opacity-50" aria-label="Enviar">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function Bubble({ m, mine }: { m: Message; mine: boolean }) {
  if (m.from === "sistema") {
    return (
      <div className="mx-auto w-fit max-w-[90%] rounded-xl bg-white px-3 py-1.5 text-center text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border">
        {m.text}
      </div>
    );
  }
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] overflow-hidden rounded-2xl text-sm shadow-sm", mine ? "rounded-br-sm bg-primary text-white" : "rounded-bl-sm bg-white")}>
        {m.image && (
          <div className="relative">
            <SafeImage src={m.image} alt="Foto del servicio" className="h-44 w-60" />
            {m.video && (
              <div className="absolute inset-0 grid place-items-center bg-black/25">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/90">
                  <Play className="ml-0.5 h-5 w-5 fill-primary text-primary" />
                </div>
                <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 text-[10px] font-semibold text-white">0:15</span>
              </div>
            )}
          </div>
        )}
        <div className="px-3 py-2">
          {m.text}
          <div className={cn("mt-0.5 text-right text-[10px]", mine ? "text-white/70" : "text-muted-foreground")}>{formatTime(m.at)}</div>
        </div>
      </div>
    </div>
  );
}
