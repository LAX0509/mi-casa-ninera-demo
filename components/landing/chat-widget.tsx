"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCheck, MessageCircle, Phone, Send, Smartphone, Video, X } from "lucide-react";
import { BOT_WELCOME, botReply, type BotReply } from "@/lib/bot";
import { actions } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ChatMsg extends BotReply {
  id: number;
  from: "bot" | "user";
  time: string;
}

const now = () => new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? <strong key={i}>{p.slice(1, -1)}</strong> : <span key={i}>{p}</span>
      )}
    </>
  );
}

export const OPEN_CHAT_EVENT = "mcn:open-chat";

export function ChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [unread, setUnread] = useState(1);
  const lastQuestion = useRef("Consulta general");
  const endRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, h);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, h);
  }, []);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setTyping(true);
      const t = setTimeout(() => {
        setTyping(false);
        setMsgs([{ ...BOT_WELCOME, id: counter.current++, from: "bot", time: now() }]);
      }, 700);
      return () => clearTimeout(t);
    }
    if (open) setUnread(0);
  }, [open, msgs.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean || typing) return;
    lastQuestion.current = clean;
    setMsgs((m) => [...m, { id: counter.current++, from: "user", text: clean, time: now() }]);
    setInput("");
    setTyping(true);
    const reply = botReply(clean);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { ...reply, id: counter.current++, from: "bot", time: now() }]);
    }, 900 + Math.min(1600, reply.text.length * 6));
  }

  function startBooking() {
    actions.addLead(lastQuestion.current);
    router.push("/padres?origen=whatsapp");
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[900] grid h-16 w-16 place-items-center rounded-full bg-whatsapp text-white shadow-2xl shadow-green-600/30 transition hover:scale-105 active:scale-95"
        aria-label="Abrir chat de WhatsApp"
      >
        {open ? <X className="h-7 w-7" /> : <MessageCircle className="h-8 w-8" />}
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full bg-warm text-xs font-bold ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>
      {!open && (
        <div className="pointer-events-none fixed bottom-8 right-24 z-[899] hidden animate-float rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-navy shadow-soft sm:block">
          ¿Dudas? Habla con Lucía, nuestra IA 💬
        </div>
      )}

      {/* Ventana de chat */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[950] flex h-[100dvh] flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 sm:inset-x-auto sm:bottom-24 sm:right-5 sm:h-[620px] sm:max-h-[calc(100dvh-120px)] sm:w-[390px] sm:rounded-3xl",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        )}
      >
        <div className="flex items-center gap-3 bg-whatsapp-dark px-4 py-3 text-white">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-mint to-primary text-lg">🤖</div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-whatsapp ring-2 ring-whatsapp-dark" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">Lucía · Mi Casa Niñera</div>
            <div className="text-xs text-white/75">{typing ? "escribiendo…" : "Agente IA · en línea 24/7"}</div>
          </div>
          <Video className="h-5 w-5 opacity-80" />
          <Phone className="h-5 w-5 opacity-80" />
          <button onClick={() => setOpen(false)} className="ml-1 rounded-full p-1 hover:bg-white/10 sm:hidden" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-whatsapp-pattern scrollbar-thin flex-1 space-y-2 overflow-y-auto px-3 py-4">
          <div className="mx-auto w-fit rounded-lg bg-[#FFF5C4] px-3 py-1.5 text-center text-[11px] text-[#54656f] shadow-sm">
            🔒 Simulación del Agente IA en WhatsApp Business
          </div>
          {msgs.map((m) => (
            <div key={m.id} className={cn("flex flex-col", m.from === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-[13.5px] leading-snug text-[#111b21] shadow-sm",
                  m.from === "user" ? "rounded-tr-sm bg-whatsapp-bubble" : "rounded-tl-sm bg-white"
                )}
              >
                <Rich text={m.text} />
                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]">
                  {m.time}
                  {m.from === "user" && <CheckCheck className="h-3.5 w-3.5 text-sky-500" />}
                </div>
              </div>
              {m.from === "bot" && m.cta && (
                <button
                  onClick={startBooking}
                  className="mt-1.5 flex max-w-[85%] items-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-secondary"
                >
                  <Smartphone className="h-4 w-4" /> Iniciar Reserva en App <ArrowRight className="h-4 w-4" />
                </button>
              )}
              {m.from === "bot" && m.quick && m.id === msgs[msgs.length - 1]?.id && (
                <div className="mt-2 flex max-w-[95%] flex-wrap gap-1.5">
                  {m.quick.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-whatsapp/40 bg-white px-3 py-1 text-xs font-semibold text-whatsapp-dark shadow-sm transition hover:bg-whatsapp-bubble"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-[#667781]" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="safe-bottom flex items-center gap-2 bg-[#f0f2f5] px-3 pt-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje"
            className="h-11 flex-1 rounded-full bg-white px-4 text-sm outline-none ring-whatsapp/40 focus:ring-2"
          />
          <button type="submit" className="grid h-11 w-11 place-items-center rounded-full bg-whatsapp-dark text-white transition hover:bg-whatsapp-dark/90" aria-label="Enviar">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </>
  );
}

export function OpenChatButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}>
      {children}
    </button>
  );
}
