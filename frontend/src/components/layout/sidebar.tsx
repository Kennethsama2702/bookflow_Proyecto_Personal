import {
  LayoutDashboard,
  CalendarClock,
  MessageSquare,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

export type ModuleKey = "dashboard" | "agenda" | "chat";

interface Props {
  active: ModuleKey;
  onSelect: (key: ModuleKey) => void;
  userEmail: string;
  onLogout: () => void;
}

const ITEMS: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "agenda", label: "Agendamiento", icon: <CalendarClock size={20} /> },
  { key: "chat", label: "Chat", icon: <MessageSquare size={20} /> },
];

export default function Sidebar({
  active,
  onSelect,
  userEmail,
  onLogout,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <CalendarClock size={22} />
        <span>BookFlow</span>
      </div>

      <nav className="sidebar-nav">
        {ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-item ${active === item.key ? "active" : ""}`}
            onClick={() => onSelect(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" title={userEmail}>
          {userEmail}
        </div>
        <button className="sidebar-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
