import { CalendarDays, MapPin, Play, ShoppingBag, Ticket } from "lucide-react";
import { useState } from "react";
import type { UserRole } from "../../api";
import ChatbotWidget from "../chatbot/chatbotwidget";
import logotipo from "../../assets/Logotipo_Cinefilo.png";
import "./clientcatalogpage.css";

interface Props {
  fullName?: string;
  role?: UserRole;
  onRequireAuth: () => void;
  onAction?: (action: "tickets" | "concessions" | "showtime") => void;
  onLogout?: () => void;
}

const MOVIES = [
  {
    title: "Horizonte Cero",
    genre: "Ciencia ficción",
    duration: "2h 08m",
    rating: "PG-13",
    color: "#cf5d42",
  },
  {
    title: "La última función",
    genre: "Drama",
    duration: "1h 52m",
    rating: "PG",
    color: "#315c7d",
  },
  {
    title: "Ritmo de verano",
    genre: "Musical",
    duration: "1h 45m",
    rating: "G",
    color: "#d99b45",
  },
];

export default function ClientCatalogPage({
  fullName,
  role = "CLIENTE",
  onRequireAuth,
  onAction,
  onLogout,
}: Props) {
  const [selectedMovie, setSelectedMovie] = useState(MOVIES[0].title);
  const selected =
    MOVIES.find((movie) => movie.title === selectedMovie) ?? MOVIES[0];

  return (
    <div className="client-experience">
      <header className="client-header">
        <div>
          <img
            className="client-brand"
            src={logotipo}
            alt="Cinefilo, Más que películas"
          />
          <h1>Tu próxima historia empieza aquí.</h1>
          <p>
            Más que películas. Explora la cartelera, compara horarios y
            encuentra tu lugar favorito.
          </p>
        </div>
        <button
          className="client-login-button"
          onClick={fullName && onLogout ? onLogout : onRequireAuth}
        >
          {fullName ? "Cerrar sesión" : "Iniciar sesión"}
        </button>
      </header>

      <section className="client-toolbar" aria-label="Filtros de cartelera">
        <button className="client-filter active">
          <MapPin size={16} /> Cinefilo
        </button>
        <button className="client-filter">
          <CalendarDays size={16} /> Hoy, 23 sep
        </button>
        <span className="client-results">
          {MOVIES.length} películas en cartelera
        </span>
      </section>

      <section className="movie-grid">
        {MOVIES.map((movie) => (
          <button
            className={`movie-card ${selectedMovie === movie.title ? "selected" : ""}`}
            key={movie.title}
            onClick={() => setSelectedMovie(movie.title)}
          >
            <span className="movie-poster" style={{ background: movie.color }}>
              <Play size={28} fill="currentColor" />
              <strong>{movie.title}</strong>
            </span>
            <span className="movie-card-body">
              <strong>{movie.title}</strong>
              <span>
                {movie.genre} · {movie.duration}
              </span>
              <small>{movie.rating}</small>
            </span>
          </button>
        ))}
      </section>

      <section className="showtime-panel">
        <div>
          <span className="client-kicker">HORARIOS DISPONIBLES</span>
          <h2>{selected.title}</h2>
          <p>
            {selected.genre} · {selected.duration} · Sala Atmos
          </p>
        </div>
        <div className="showtime-list">
          {["14:20", "17:10", "20:00"].map((time) => (
            <button
              key={time}
              onClick={() =>
                onAction ? onAction("showtime") : onRequireAuth()
              }
            >
              {time}
            </button>
          ))}
        </div>
      </section>

      <section className="client-quick-actions">
        <button
          onClick={() => (onAction ? onAction("tickets") : onRequireAuth())}
        >
          <Ticket size={18} /> Mis tickets
        </button>
        <button
          onClick={() => (onAction ? onAction("concessions") : onRequireAuth())}
        >
          <ShoppingBag size={18} /> Comprar confitería
        </button>
      </section>

      <section className="catalog-assistant-callout">
        <div>
          <span className="client-kicker">¿NO SABES QUÉ ELEGIR?</span>
          <h2>Déjanos encontrar tu próxima película.</h2>
          <p>
            ¿No sabes dónde ir o qué horario te conviene? Pregúntale a nuestro
            chatbot: te ayudará a elegir la mejor película para ti.
          </p>
        </div>
        <button
          onClick={() =>
            document.querySelector<HTMLButtonElement>(".chatbot-fab")?.click()
          }
        >
          Preguntar ahora
        </button>
      </section>

      <ChatbotWidget fullName={fullName ?? "cliente"} role={role} />
    </div>
  );
}
