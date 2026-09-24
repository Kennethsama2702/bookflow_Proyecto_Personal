import {
  BarChart3,
  CalendarClock,
  ChevronLeft,
  Clapperboard,
  LayoutDashboard,
  MapPinned,
  ScanLine,
  Settings2,
  ShoppingBasket,
  Ticket,
  Users,
} from "lucide-react";
import isotipo from "../../assets/Isotipo_Cinefilo.png";
import logotipo from "../../assets/Logotipo_Cinefilo.png";
import "./sidebar.css";
import type { UserRole } from "../../api";

export type ModuleKey =
  | "access"
  | "dashboard"
  | "catalog"
  | "venues"
  | "showtimes"
  | "reservations"
  | "tickets"
  | "concessions"
  | "users"
  | "reports";

interface Props {
  active: ModuleKey;
  onSelect: (key: ModuleKey) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  role: UserRole;
}

const ITEMS: {
  key: ModuleKey;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: ["ADMINISTRADOR", "SUPERVISOR", "PERSONAL_CONFITERIA"],
  },
  {
    key: "catalog",
    label: "Películas",
    icon: <Clapperboard size={20} />,
    roles: ["ADMINISTRADOR", "SUPERVISOR"],
  },
  {
    key: "venues",
    label: "Sedes y salas",
    icon: <MapPinned size={20} />,
    roles: ["ADMINISTRADOR"],
  },
  {
    key: "showtimes",
    label: "Funciones y precios",
    icon: <CalendarClock size={20} />,
    roles: ["ADMINISTRADOR", "SUPERVISOR"],
  },
  {
    key: "reservations",
    label: "Reservas",
    icon: <Ticket size={20} />,
    roles: [
      "ADMINISTRADOR",
      "SUPERVISOR",
      "PERSONAL_ACCESO",
      "PERSONAL_CONFITERIA",
    ],
  },
  {
    key: "tickets",
    label: "Validar tickets QR",
    icon: <ScanLine size={20} />,
    roles: ["ADMINISTRADOR", "PERSONAL_ACCESO"],
  },
  {
    key: "concessions",
    label: "Confitería y pedidos",
    icon: <ShoppingBasket size={20} />,
    roles: ["ADMINISTRADOR", "SUPERVISOR", "PERSONAL_CONFITERIA"],
  },
  {
    key: "users",
    label: "Usuarios y roles",
    icon: <Users size={20} />,
    roles: ["ADMINISTRADOR"],
  },
  {
    key: "reports",
    label: "Reportes y auditoría",
    icon: <BarChart3 size={20} />,
    roles: ["ADMINISTRADOR", "SUPERVISOR"],
  },
  {
    key: "access",
    label: "Mis módulos",
    icon: <Settings2 size={20} />,
    roles: [
      "ADMINISTRADOR",
      "SUPERVISOR",
      "PERSONAL_ACCESO",
      "PERSONAL_CONFITERIA",
    ],
  },
];

export default function Sidebar({
  active,
  onSelect,
  collapsed,
  onToggleCollapsed,
  role,
}: Props) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <picture>
          <source media="(max-width: 1px)" srcSet={isotipo} />
          <img
            src={collapsed ? isotipo : logotipo}
            alt="Cinefilo"
            className="sidebar-logo"
          />
        </picture>
      </div>

      <nav className="sidebar-nav">
        {ITEMS.filter((item) => item.roles.includes(role)).map((item) => (
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
