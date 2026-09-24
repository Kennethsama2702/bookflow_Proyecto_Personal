import type { UserRole } from "../../api";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRADOR: "Administrador",
  SUPERVISOR: "Supervisor",
  PERSONAL_ACCESO: "Personal de acceso",
  PERSONAL_CONFITERIA: "Personal de confitería",
  CLIENTE: "Cliente",
};

const ROLE_MODULES: Record<UserRole, string[]> = {
  ADMINISTRADOR: [
    "Dashboard",
    "Películas",
    "Sedes y salas",
    "Funciones",
    "Reservas",
    "Confitería",
    "Usuarios y roles",
    "Reportes",
    "Auditoría",
  ],
  SUPERVISOR: [
    "Dashboard",
    "Películas",
    "Funciones",
    "Reservas",
    "Confitería",
    "Reportes",
    "Auditoría",
  ],
  PERSONAL_ACCESO: ["Cartelera", "Reservas", "Validación de tickets QR"],
  PERSONAL_CONFITERIA: ["Dashboard", "Pedidos de confitería", "Reservas"],
  CLIENTE: [
    "Catálogo de películas",
    "Cartelera",
    "Mis reservas",
    "Mis tickets",
    "Puntos y recompensas",
  ],
};

export default function RoleAccessPage({ role }: { role: UserRole }) {
  return (
    <div className="page">
      <h1>{ROLE_LABELS[role]}</h1>
      <p className="page-subtitle">
        Módulos disponibles para esta cuenta demo.
      </p>
      <div className="stat-grid">
        {ROLE_MODULES[role].map((module) => (
          <div className="stat-card" key={module}>
            <span className="stat-label">Disponible</span>
            <span className="stat-value">{module}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
