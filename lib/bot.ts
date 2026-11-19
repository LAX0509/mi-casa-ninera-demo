import { formatCOP } from "./utils";

export interface BotReply {
  text: string;
  quick?: string[];
  cta?: boolean;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));

export const BOT_WELCOME: BotReply = {
  text: "¡Hola! 👋 Soy *Lucía*, la asistente virtual de Mi Casa Niñera. Te ayudo con tarifas, perfiles de cuidadores, cobertura y reservas, 24/7. ¿En qué te puedo ayudar?",
  quick: ["Ver tarifas", "¿Qué servicios tienen?", "¿Cómo garantizan la seguridad?", "Quiero reservar"],
};

/** Motor de intenciones simple que simula al Agente IA (Gemini/OpenAI en producción). */
export function botReply(input: string): BotReply {
  const t = norm(input);

  if (has(t, ["precio", "tarifa", "cuanto", "costo", "valor", "cobran"])) {
    return {
      text: `Estas son nuestras tarifas 💙\n\n• Cuidado Infantil: desde ${formatCOP(28000)}/hora\n• Tutoría Académica: desde ${formatCOP(40000)}/hora\n• Cuidado Nocturno: ${formatCOP(36000)}/hora\n• Plan Integral Mensual (40 h + informes de progreso): ${formatCOP(1190000)}\n\nMínimo 2 horas por servicio. ¿Quieres que te muestre los perfiles disponibles en tu zona?`,
      quick: ["Ver perfiles", "Plan mensual", "Quiero reservar"],
      cta: true,
    };
  }
  if (has(t, ["mensual", "plan", "paquete", "suscrip"])) {
    return {
      text: `El *Plan Integral Mensual* (${formatCOP(1190000)}) incluye 40 horas, cuidador(a) fijo(a), plan pedagógico personalizado, diario de progreso y un informe mensual con logros académicos. Además tienes prioridad en Backup Express 🔄`,
      quick: ["Quiero reservar", "¿Cómo garantizan la seguridad?"],
      cta: true,
    };
  }
  if (has(t, ["matemat", "tutor", "tarea", "colegio", "academ", "ingles", "examen"])) {
    return {
      text: "¡Claro! Tenemos licenciados y tutores en Matemáticas, inglés y lectoescritura 📚. Usan metodologías como Singapur y aprendizaje por juego, y cada sesión deja un registro de avances académicos para ti. Te recomiendo a *Andrés Montoya* (★4.85) o *Juliana Zapata* (★4.88, bilingüe).",
      quick: ["Ver tarifas", "Ver perfiles", "Quiero reservar"],
      cta: true,
    };
  }
  if (has(t, ["segur", "confian", "verific", "antecedente", "sos", "emergencia", "gps", "rastreo"])) {
    return {
      text: "Tu tranquilidad es lo primero 🛡️\n\n• 100% del personal con antecedentes verificados y certificación en primeros auxilios.\n• Rastreo GPS en vivo durante todo el servicio.\n• Check-in con código OTP/QR que solo tú tienes.\n• Botón SOS: llama a emergencias, a ti y alerta a nuestra torre de control con la ubicación en tiempo real.\n• Pase de salida digital firmado al terminar.",
      quick: ["Ver perfiles", "Quiero reservar"],
      cta: true,
    };
  }
  if (has(t, ["servicio", "ofrecen", "hacen", "que tienen"])) {
    return {
      text: "Ofrecemos:\n\n👶 *Cuidado Infantil* con actividades pedagógicas\n📚 *Tutoría Académica* (matemáticas, inglés, lectoescritura)\n🩺 *Cuidadores con Primeros Auxilios / Enfermería* para bebés o niños con alergias\n🌙 *Cuidado Nocturno* y fines de semana",
      quick: ["Ver tarifas", "¿Cómo garantizan la seguridad?", "Quiero reservar"],
    };
  }
  if (has(t, ["zona", "cobertura", "donde", "barrio", "medellin", "envigado", "sabaneta", "poblado", "laureles", "bello", "itagui"])) {
    return {
      text: "Tenemos cobertura en todo el Valle de Aburrá 📍: El Poblado, Laureles, Belén, Envigado, Sabaneta, Itagüí y Bello. Nuestro algoritmo de matchmaking te sugiere los 3 cuidadores más compatibles y cercanos a tu casa.",
      quick: ["Ver perfiles", "Quiero reservar"],
      cta: true,
    };
  }
  if (has(t, ["cancel", "no llega", "imprevist", "falla", "backup"])) {
    return {
      text: "Con *Backup Express* 🔄 si tu cuidador(a) tiene un imprevisto, el sistema reasigna automáticamente a otro profesional cualificado y cercano. Garantía de cumplimiento del 99.9%. Puedes cancelar gratis hasta 6 horas antes.",
      quick: ["Quiero reservar", "Ver tarifas"],
    };
  }
  if (has(t, ["horario", "hora", "dispon", "noche", "fin de semana", "hoy", "urgente"])) {
    return {
      text: "Atendemos 7 días a la semana, de 6:00 a.m. a 11:00 p.m., y cuidado nocturno bajo reserva 🌙. Para hoy aún tenemos personal disponible en El Poblado, Laureles y Envigado.",
      quick: ["Quiero reservar", "Ver tarifas"],
      cta: true,
    };
  }
  if (has(t, ["reserv", "agendar", "contratar", "perfil", "quiero", "necesito"])) {
    return {
      text: "¡Perfecto! 🎉 Te llevo directo a la App para que elijas a tu cuidador(a), completes la ficha de tu hijo(a) y confirmes la reserva en menos de 2 minutos.",
      cta: true,
    };
  }
  if (has(t, ["hola", "buenas", "buenos", "hey", "saludo"])) {
    return { text: "¡Hola! 😊 ¿Buscas cuidado infantil o tutoría académica?", quick: ["Cuidado infantil", "Tutoría de matemáticas", "Ver tarifas"] };
  }
  if (has(t, ["cuidado", "ninera", "bebe", "nino", "nina", "hijo", "hija"])) {
    return {
      text: "Tenemos licenciadas en educación infantil y enfermeras pediátricas 💙. Antes del servicio llenas una ficha con rutinas, alergias y gustos de tu hijo(a), y durante el turno recibes fotos, chat y ubicación en vivo.",
      quick: ["Ver tarifas", "Ver perfiles", "Quiero reservar"],
      cta: true,
    };
  }
  if (has(t, ["gracias", "listo", "perfecto", "ok"])) {
    return { text: "¡Con gusto! 💙 Si quieres, puedes iniciar tu reserva ahora mismo desde la App.", cta: true };
  }
  return {
    text: "Entiendo 🙂. Puedo ayudarte con tarifas, tipos de servicio, seguridad, cobertura o iniciar una reserva. ¿Qué te gustaría saber?",
    quick: ["Ver tarifas", "¿Qué servicios tienen?", "Quiero reservar"],
  };
}
