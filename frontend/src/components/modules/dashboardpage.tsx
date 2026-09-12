import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/themecontext";

// Datos de ejemplo -- cuando exista el módulo de payments/bookings, esto viene
// de las vistas v_daily_revenue / v_monthly_summary del backend, no hardcodeado.
const REVENUE_DATA = [
  { month: "May", ingresos: 1200 },
  { month: "Jun", ingresos: 1850 },
  { month: "Jul", ingresos: 1600 },
  { month: "Ago", ingresos: 2400 },
  { month: "Sep", ingresos: 2100 },
];

const BOOKINGS_DATA = [
  { day: "Lun", reservas: 4 },
  { day: "Mar", reservas: 7 },
  { day: "Mié", reservas: 5 },
  { day: "Jue", reservas: 9 },
  { day: "Vie", reservas: 12 },
  { day: "Sáb", reservas: 6 },
  { day: "Dom", reservas: 2 },
];

export default function DashboardPage() {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#263449" : "#e2e8f0";
  const textColor = theme === "dark" ? "#94a3b8" : "#475569";
  const accent = "#2563eb";
  const tooltipBg = theme === "dark" ? "#1e293b" : "#ffffff";

  return (
    <div className="page">
      <h1>Dashboard financiero</h1>
      <p className="page-subtitle">
        Vista general del negocio -- datos de ejemplo, aún no conectado al
        backend.
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Ingresos del mes</span>
          <span className="stat-value">$2,100.00</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Reservas confirmadas</span>
          <span className="stat-value">45</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tasa de cancelación</span>
          <span className="stat-value">8%</span>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <span className="chart-title">Ingresos (últimos 5 meses)</span>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${gridColor}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke={accent}
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <span className="chart-title">Reservas por día (esta semana)</span>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BOOKINGS_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${gridColor}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="reservas" fill={accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
