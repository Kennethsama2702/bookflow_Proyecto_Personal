import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./agenda.css";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

// Datos de ejemplo -- cuando exista el backend de bookings, esto viene de
// GET /resources/:id/bookings, no hardcodeado.
function buildSampleEvents(): BookingEvent[] {
  const today = new Date();
  const base = (h: number, m = 0) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m);
  return [
    { id: "1", title: "Sala A -- Ana Torres", start: base(9), end: base(10) },
    {
      id: "2",
      title: "Cancha 1 -- Luis Pérez",
      start: base(11, 30),
      end: base(12, 30),
    },
    {
      id: "3",
      title: "Sala B -- Equipo Ventas",
      start: base(15),
      end: base(16),
    },
  ];
}

export default function AgendaPage() {
  const [events] = useState<BookingEvent[]>(buildSampleEvents);
  const [view, setView] = useState<View>("week");
  const messages = useMemo(
    () => ({
      next: "Siguiente",
      previous: "Anterior",
      today: "Hoy",
      month: "Mes",
      week: "Semana",
      day: "Día",
      agenda: "Agenda",
      noEventsInRange: "No hay reservas en este rango.",
    }),
    [],
  );

  return (
    <div className="page">
      <h1>Agendamiento</h1>
      <p className="page-subtitle">
        Calendario con datos de ejemplo -- se conecta al módulo de bookings del
        backend más adelante.
      </p>

      <div className="agenda-calendar-wrap">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          views={["month", "week", "day", "agenda"]}
          messages={messages}
          culture="es"
          style={{ height: 600 }}
        />
      </div>
    </div>
  );
}
