import { useState } from "react";
import Sidebar from "./sidebar";
import type { ModuleKey } from "./sidebar";
import TopBar from "./topbar";
import ChatbotWidget from "../chatbot/chatbotwidget";
import DashboardPage from "../modules/dashboardpage";
import AgendaPage from "../modules/agendapage";
import ChatPage from "../modules/chatpage";
import "./appshell.css";

interface Props {
  userEmail: string;
  fullName: string;
  onLogout: () => void;
}

export default function AppShell({ fullName, onLogout }: Props) {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        active={activeModule}
        onSelect={setActiveModule}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />

      <div className="app-main">
        <TopBar fullName={fullName} onLogout={onLogout} />

        <main className="app-content">
          {activeModule === "dashboard" && <DashboardPage />}
          {activeModule === "agenda" && <AgendaPage />}
          {activeModule === "chat" && <ChatPage fullName={fullName} />}
        </main>
      </div>

      <ChatbotWidget fullName={fullName} />
    </div>
  );
}
