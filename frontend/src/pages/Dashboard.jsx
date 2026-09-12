import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, AlertTriangle, CalendarDays, Scale, BarChart3 } from "lucide-react";
import api from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 403) setError("Accès réservé aux administrateurs.");
        else if (err.response?.status === 401) setError("Tu dois être connecté pour accéder à cette page.");
        else setError("Erreur lors du chargement des statistiques.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-wide">Chargement...</div>;

  if (error) {
    return (
      <div className="page-wide">
        <div className="content-card">
          <p className="error">{error}</p>
          <button onClick={() => navigate("/login")} className="btn-primary" style={{ display: "inline-flex", width: "auto", padding: "0.6rem 1.2rem" }}>
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const highRisk = stats.high_risk_count;
  const otherRisk = stats.total_predictions - highRisk;
  const pieData = [
    { name: "Risque élevé", value: highRisk },
    { name: "Risque faible/modéré", value: otherRisk },
  ];
  const COLORS = ["#c0392b", "#1f9d6b"];

  const cards = [
    { icon: Users, label: "Questionnaires remplis", value: stats.total_predictions, color: "var(--color-accent)" },
    { icon: AlertTriangle, label: "À risque élevé", value: `${stats.high_risk_percentage}%`, color: "var(--color-danger)" },
    { icon: CalendarDays, label: "Âge moyen", value: `${stats.average_age} ans`, color: "var(--color-primary)" },
    { icon: Scale, label: "IMC moyen", value: stats.average_bmi, color: "var(--color-warning)" },
  ];

  return (
    <div className="page-wide">
      <div className="hero-card">
        <div className="hero-icon">
          <BarChart3 size={26} strokeWidth={2} />
        </div>
        <div>
          <h1 className="hero-title">Dashboard administrateur</h1>
          <p className="hero-subtitle">Vue d'ensemble agrégée et anonyme de l'ensemble des questionnaires.</p>
        </div>
      </div>

      <div className="stats-grid-v2">
        {cards.map(({ icon: Icon, label, value, color }, i) => (
          <div className="stat-card-v2" key={i} style={{ "--accent": color }}>
            <div className="stat-icon" style={{ background: `${color}1a`, color }}>
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="stat-value-v2">{value}</div>
              <div className="stat-label-v2">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats.total_predictions > 0 && (
        <div className="content-card">
          <div className="content-card-title">
            <BarChart3 size={18} strokeWidth={2} />
            Répartition des niveaux de risque
          </div>

          <div className="donut-layout">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <div className="donut-center-value">{stats.total_predictions}</div>
                <div className="donut-center-label">total</div>
              </div>
            </div>

            <div className="donut-breakdown">
              <div className="breakdown-row">
                <span className="breakdown-dot" style={{ background: COLORS[1] }} />
                <div className="breakdown-text">
                  <div className="breakdown-label">Risque faible / modéré</div>
                  <div className="breakdown-sub">{otherRisk} personne{otherRisk > 1 ? "s" : ""}</div>
                </div>
                <div className="breakdown-pct">
                  {stats.total_predictions ? Math.round((otherRisk / stats.total_predictions) * 100) : 0}%
                </div>
              </div>

              <div className="breakdown-row">
                <span className="breakdown-dot" style={{ background: COLORS[0] }} />
                <div className="breakdown-text">
                  <div className="breakdown-label">Risque élevé</div>
                  <div className="breakdown-sub">{highRisk} personne{highRisk > 1 ? "s" : ""}</div>
                </div>
                <div className="breakdown-pct">{stats.high_risk_percentage}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}