import {
  LayoutDashboard,
  CalendarClock,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import isotipo from "../../assets/isotipo.png";
import "./sidebar.css";

export type ModuleKey = "dashboard" | "agenda" | "chat";

interface Props {
  active: ModuleKey;
  onSelect: (key: ModuleKey) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const ITEMS: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "agenda", label: "Agendamiento", icon: <CalendarClock size={20} /> },
  { key: "chat", label: "Chat", icon: <MessageSquare size={20} /> },
];

export default function Sidebar({
  active,
  onSelect,
  collapsed,
  onToggleCollapsed,
}: Props) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <img src={isotipo} alt="BookFlow" className="sidebar-logo" />
        {!collapsed && <span>BookFlow</span>}
      </div>

      <nav className="sidebar-nav">
        {ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-item ${active === item.key ? "active" : ""}`}
            onClick={() => onSelect(item.key)}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <button className="sidebar-collapse-btn" onClick={onToggleCollapsed}>
        <ChevronLeft
          size={18}
          style={{
            transform: collapsed ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
        {!collapsed && <span>Colapsar</span>}
      </button>
    </aside>
  );
}
