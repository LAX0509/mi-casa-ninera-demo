# Mi Casa Niñera · Demo de la Plataforma

Un MVP navegable de la propuesta *"Transformación Digital en Cuidado y Tutoría Infantil"*: un agente de IA en WhatsApp, la app de padres, la app de colaboradores con SOS y la torre de control administrativa.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · componentes estilo shadcn/ui (Radix) · Lucide · React-Leaflet (OpenStreetMap) · qrcode.react.

## Ejecutar

```bash
npm install
npm run dev
```

Luego abre http://localhost:3000.

## Desplegar en Vercel

1. Sube la carpeta a un repositorio de GitHub.
2. En Vercel elige **New Project → Import** y selecciona el repositorio. Vercel detecta Next.js solo.
3. No necesitas variables de entorno.

También puedes desplegar desde la terminal con `npx vercel`.

## Rutas

| Ruta | Módulo |
| --- | --- |
| `/` | Landing + widget de chat IA tipo WhatsApp ("Lucía") con el botón **Iniciar Reserva en App** |
| `/padres` | Explorador con filtros por especialidad, Matchmaking Top 3, modal de perfil completo y reserva |
| `/padres/nino` | Onboarding del niño: alergias, gustos, rutinas y preferencias pedagógicas |
| `/padres/servicio` | Servicio activo: mapa en vivo, código OTP + QR, chat con fotos y videos, llamada, informe final |
| `/colaboradores` | Aceptar o rechazar (Backup Express), check-in OTP/QR con geocerca, **botón SOS**, KidsCompanion AI y bitácora con firma |
| `/admin` | Torre de control: KPIs, mapa de operaciones, **banner SOS**, servicios, matriz de disponibilidad, CRM y finanzas |

## Guion sugerido para la demo

1. En `/`, abre el chat, pregunta por las tarifas y pulsa **Iniciar Reserva en App**. El prospecto queda en el CRM del admin.
2. En `/padres/servicio` verás a Valentina en camino y el código OTP **4821**.
3. En otra pestaña abre `/colaboradores`. Pulsa **Simular llegada**, luego **Check-in** con el OTP o el QR.
4. Abre `/admin` en una tercera pestaña. En colaboradores, **mantén presionado el botón SOS**. La alerta roja aparece al instante en el admin, con un sonido y el mapa centrado en la ubicación.
5. En el admin pulsa **Atender** y luego **Marcar resuelta**. El modal del colaborador se actualiza en tiempo real.
6. Finaliza el servicio con la bitácora. Puedes usar "Sugerir con IA"; también hay que completar el checklist y la firma. Los padres reciben el informe.
7. Para empezar de cero usa **Reiniciar demo** en el admin.

## Arquitectura del "tiempo real"

`lib/store.ts` es un store sin backend. Usa `useSyncExternalStore`, persiste en `localStorage` y se sincroniza entre pestañas con el evento `storage`. Así la demo funciona al 100 % sin configuración.

**Migrar a Supabase:**
- Cambia `commit()` por `insert`/`update` sobre las tablas `services`, `messages`, `sos_alerts`, `leads` y `activity`.
- Cambia el listener de `storage` por `supabase.channel('ops').on('postgres_changes', …)`.
- Las acciones de `actions.*` ya están separadas por caso de uso. Cada una equivale a un endpoint o RPC.

La posición GPS se simula de forma determinista, a partir de la hora de aceptación o del check-in (`caregiverPosition`). Por eso todas las pestañas ven el mismo movimiento.

## Estructura

```
app/            páginas (landing, padres, colaboradores, admin)
components/ui   primitivas estilo shadcn (button, card, dialog, tabs…)
components/     landing, map, padres, colaboradores, shared
lib/            data (mock Medellín), store, geo, bot (intenciones IA), matchmaking
```
