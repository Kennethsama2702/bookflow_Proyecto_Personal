import { useState, useEffect } from "react";
import { register, login, fetchMe } from "./api";
import "./App.css";

type View = "login" | "register";

export default function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [view, setView] = useState<View>("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUserEmail(null);
      return;
    }
    fetchMe(token)
      .then((res) => setUserEmail(res.user.email))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      });
  }, [token]);

  function handleAuthSuccess(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setError(null);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setView("login");
  }

  if (token && userEmail) {
    return (
      <div className="card">
        <h1>BookFlow</h1>
        <p>
          Sesión activa como <strong>{userEmail}</strong>
        </p>
        <p className="hint">
          Esto vino de GET /me con tu token -- si esto se ve, todo el flujo de
          auth funciona de verdad.
        </p>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      if (view === "login") {
        const res = await login(email, password);
        handleAuthSuccess(res.token);
      } else {
        const fullName = form.get("fullName") as string;
        const res = await register(email, password, fullName);
        handleAuthSuccess(res.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>BookFlow</h1>
      <div className="tabs">
        <button
          className={view === "login" ? "active" : ""}
          onClick={() => setView("login")}
        >
          Iniciar sesión
        </button>
        <button
          className={view === "register" ? "active" : ""}
          onClick={() => setView("register")}
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {view === "register" && (
          <input name="fullName" placeholder="Nombre completo" required />
        )}
        <input name="email" type="email" placeholder="Correo" required />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          required
        />
        <button type="submit" disabled={loading}>
          {loading
            ? "Enviando..."
            : view === "login"
              ? "Entrar"
              : "Crear cuenta"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
