export default function DashboardPage() {
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
          <span className="stat-value">$0.00</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Reservas confirmadas</span>
          <span className="stat-value">0</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tasa de cancelación</span>
          <span className="stat-value">0%</span>
        </div>
      </div>

      <div className="placeholder-block">Gráfico de ingresos (pendiente)</div>
    </div>
  );
}
