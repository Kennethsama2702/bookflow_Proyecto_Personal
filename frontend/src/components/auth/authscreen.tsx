import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Lock, Mail } from "lucide-react";
import isotipo from "../../assets/Isotipo_Cinefilo.png";
import { register, login } from "../../api";
import "./authscreen.css";

type Mode = "login" | "register";

interface Props {
  onAuthSuccess: (token: string) => void;
  onCancel?: () => void;
}

export default function AuthScreen({ onAuthSuccess, onCancel }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      if (mode === "login") {
        const res = await login(email, password);
        onAuthSuccess(res.token);
      } else {
        const fullName = form.get("fullName") as string;
        const res = await register(email, password, fullName);
        onAuthSuccess(res.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-icon">
          <img src={isotipo} alt="Cinefilo" />
        </div>
        {onCancel && (
          <div className="auth-cancel-wrap">
            <button type="button" className="auth-cancel" onClick={onCancel}>
              <span aria-hidden="true">←</span> Volver a cartelera
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: mode === "login" ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "login" ? 24 : -24 }}
            transition={{ duration: 0.25 }}
          >
            {mode === "register" && (
              <div className="input-group">
                <User size={18} />
                <input
                  name="fullName"
                  placeholder="Nombre completo"
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="input-group">
              <Mail size={18} />
              <input
                name="email"
                type="email"
                placeholder="Correo"
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                name="password"
                type="password"
                placeholder="Contraseña"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? "Enviando..."
                : mode === "login"
                  ? "LOGIN"
                  : "CREAR CUENTA"}
            </button>

            {error && <p className="auth-error">{error}</p>}

            <p className="auth-toggle">
              {mode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
