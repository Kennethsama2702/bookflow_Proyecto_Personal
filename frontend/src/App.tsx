import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import AuthScreen from "./components/auth/authscreen";
import LoadingScreen from "./components/loadingscreen";
import AppShell from "./components/layout/appshell";
import { fetchMe } from "./api";

type Phase = "checking" | "auth" | "loading" | "app";

export default function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");

  useEffect(() => {
    if (!token) {
      setPhase("auth");
      return;
    }
    fetchMe(token)
      .then((res) => {
        setUserEmail(res.user.email);
        setPhase("app");
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setPhase("auth");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAuthSuccess(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setPhase("loading");

    fetchMe(newToken)
      .then((res) => {
        setUserEmail(res.user.email);
        setTimeout(() => setPhase("app"), 900);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setPhase("auth");
      });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setUserEmail(null);
    setPhase("auth");
  }

  return (
    <AnimatePresence mode="wait">
      {phase === "checking" && <LoadingScreen key="checking" />}
      {phase === "auth" && (
        <AuthScreen key="auth" onAuthSuccess={handleAuthSuccess} />
      )}
      {phase === "loading" && <LoadingScreen key="loading" />}
      {phase === "app" && userEmail && (
        <AppShell key="app" userEmail={userEmail} onLogout={handleLogout} />
      )}
    </AnimatePresence>
  );
}
