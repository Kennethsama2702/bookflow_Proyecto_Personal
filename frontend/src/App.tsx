import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/themecontext";
import AuthScreen from "./components/auth/authscreen";
import LoadingScreen from "./components/loadingscreen";
import AppShell from "./components/layout/appshell";
import { fetchMe, logout, refresh } from "./api";

type Phase = "checking" | "auth" | "loading" | "app";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const lastActivity = useRef(Date.now());
  const initializationStarted = useRef(false);

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    refresh()
      .then((auth) => {
        setToken(auth.token);
        lastActivity.current = Date.now();
        return fetchMe(auth.token);
      })
      .then((res) => {
        setUserEmail(res.user.email);
        setFullName(res.user.fullName);
        setPhase("app");
      })
      .catch(() => {
        setPhase("auth");
      });
  }, []);

  useEffect(() => {
    if (phase !== "app" || !token) return;

    const markActivity = () => {
      lastActivity.current = Date.now();
    };
    const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((event) =>
      window.addEventListener(event, markActivity),
    );

    const refreshTimer = window.setInterval(() => {
      const activeRecently = Date.now() - lastActivity.current < 30 * 60 * 1000;
      if (!activeRecently) return;

      refresh()
        .then((auth) => setToken(auth.token))
        .catch(() => {
          setToken(null);
          setUserEmail(null);
          setFullName(null);
          setPhase("auth");
        });
    }, 60 * 1000);

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, markActivity),
      );
      window.clearInterval(refreshTimer);
    };
  }, [phase, token]);

  function handleAuthSuccess(newToken: string) {
    setToken(newToken);
    lastActivity.current = Date.now();
    setPhase("loading");

    fetchMe(newToken)
      .then((res) => {
        setUserEmail(res.user.email);
        setFullName(res.user.fullName);
        setTimeout(() => setPhase("app"), 900);
      })
      .catch(() => {
        setPhase("auth");
      });
  }

  async function handleLogout() {
    await logout();
    setToken(null);
    setUserEmail(null);
    setFullName(null);
    setPhase("auth");
  }

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {phase === "checking" && <LoadingScreen key="checking" />}
        {phase === "auth" && (
          <AuthScreen key="auth" onAuthSuccess={handleAuthSuccess} />
        )}
        {phase === "loading" && <LoadingScreen key="loading" />}
        {phase === "app" && userEmail && fullName && (
          <AppShell
            key="app"
            userEmail={userEmail}
            fullName={fullName}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
