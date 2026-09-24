import { useState } from "react";
import Sidebar from "./sidebar";
import type { ModuleKey } from "./sidebar";
import TopBar from "./topbar";
import ChatbotWidget from "../chatbot/chatbotwidget";
import DashboardPage from "../modules/dashboardpage";
import RoleAccessPage from "../modules/roleaccesspage";
import type { UserRole } from "../../api";
import "./appshell.css";

interface Props {
  userEmail: string;
  fullName: string;
  onLogout: () => void;
  role: UserRole;
}

export default function AppShell({ fullName, onLogout, role }: Props) {
  const [activeModule, setActiveModule] = useState<ModuleKey>("access");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        active={activeModule}
        onSelect={setActiveModule}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        role={role}
      />

      <div className="app-main">
        <TopBar fullName={fullName} onLogout={onLogout} />

        <main className="app-content">
          {activeModule === "access" && <RoleAccessPage role={role} />}
          {activeModule === "dashboard" && <DashboardPage />}
        </main>
      </div>

      <ChatbotWidget fullName={fullName} role={role} />
    </div>
  );
}
