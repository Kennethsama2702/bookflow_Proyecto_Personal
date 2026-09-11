import { useState } from "react";
import Sidebar from "./sidebar";
import type { ModuleKey } from "./sidebar";
import ChatbotButton from "../chatbotbutton";
import DashboardPage from "../modules/dashboardpage";
import AgendaPage from "../modules/agendapage";
import ChatPage from "../modules/chatpage";
import "./AppShell.css";

interface Props {
  userEmail: string;
  onLogout: () => void;
}

export default function AppShell({ userEmail, onLogout }: Props) {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");

  return (
    <div className="app-shell">
      <Sidebar
        active={activeModule}
        onSelect={setActiveModule}
        userEmail={userEmail}
        onLogout={onLogout}
      />

      <main className="app-content">
        {activeModule === "dashboard" && <DashboardPage />}
        {activeModule === "agenda" && <AgendaPage />}
        {activeModule === "chat" && <ChatPage />}
      </main>

      <ChatbotButton />
    </div>
  );
}
