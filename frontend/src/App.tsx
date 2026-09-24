import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/themecontext";
import AuthScreen from "./components/auth/authscreen";
import LoadingScreen from "./components/loadingscreen";
import AppShell from "./components/layout/appshell";
import ClientCatalogPage from "./components/modules/clientcatalogpage";
import ClientJourneyPage from "./components/modules/clientjourneypage";
import {
  fetchMe,
  fetchOrganizations,
  logout,
  refresh,
  type UserRole,
} from "./api";

type Phase = "checking" | "public" | "auth" | "loading" | "app";
type ClientAction = "tickets" | "concessions" | "showtime";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("CLIENTE");
  const [clientAction, setClientAction] = useState<ClientAction | null>(null);
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
        return fetchMe(auth.token).then(async (me) => {
          const organizations = await fetchOrganizations(auth.token);
          setRole(organizations.organizations[0]?.role ?? "CLIENTE");
          return me;
        });
      })
      .then((res) => {
        setUserEmail(res.user.email);
        setFullName(res.user.fullName);
        setPhase("app");
      })
      .catch(() => {
        setPhase("public");
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
      .then(async (res) => {
        setUserEmail(res.user.email);
        setFullName(res.user.fullName);
        const organizations = await fetchOrganizations(newToken);
        setRole(organizations.organizations[0]?.role ?? "CLIENTE");
        setTimeout(() => setPhase("app"), 900);
      })
      .catch(() => {
        setPhase("public");
      });
  }

  function requireAuth() {
    setClientAction(null);
    setPhase("auth");
  }

  function requestClientAction(action: ClientAction) {
    setClientAction(action);
    if (role === "CLIENTE" && token) return;
    setPhase("auth");
  }

  async function handleLogout() {
    await logout();
    setToken(null);
    setUserEmail(null);
    setFullName(null);
    setPhase(role === "CLIENTE" ? "public" : "auth");
  }

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {phase === "checking" && <LoadingScreen key="checking" />}
        {phase === "public" && (
          <ClientCatalogPage
            key="public"
            onRequireAuth={requireAuth}
            onAction={requestClientAction}
          />
        )}
        {phase === "auth" && (
          <AuthScreen
            key="auth"
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setPhase("public")}
          />
        )}
        {phase === "loading" && <LoadingScreen key="loading" />}
        {phase === "app" && role === "CLIENTE" && clientAction && (
          <ClientJourneyPage
            key="journey"
            journey={clientAction}
            onBack={() => setClientAction(null)}
          />
        )}
        {phase === "app" && role === "CLIENTE" && !clientAction && (
          <ClientCatalogPage
            key="client"
            fullName={fullName ?? undefined}
            role={role}
            onRequireAuth={requireAuth}
            onAction={requestClientAction}
            onLogout={handleLogout}
          />
        )}
        {phase === "app" && role !== "CLIENTE" && userEmail && fullName && (
          <AppShell
            key="app"
            userEmail={userEmail}
            fullName={fullName}
            role={role}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}
