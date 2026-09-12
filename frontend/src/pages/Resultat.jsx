import { useLocation, useNavigate } from "react-router-dom";

const factorInfo = {
  Pregnancies: { label: "Nombre de grossesses", unit: "", desc: "Un nombre élevé de grossesses est statistiquement associé à un risque accru." },
  Glucose: { label: "Taux de glucose", unit: "mg/dL", desc: "Un taux élevé est l'un des indicateurs les plus directs du risque de diabète." },
  BloodPressure: { label: "Tension artérielle", unit: "mm Hg", desc: "Une tension élevée est souvent corrélée à des troubles métaboliques." },
  SkinThickness: { label: "Épaisseur du pli cutané", unit: "mm", desc: "Reflète indirectement la masse graisseuse, liée à la résistance à l'insuline." },
  Insulin: { label: "Taux d'insuline", unit: "mu U/mL", desc: "Un taux anormal peut indiquer une résistance à l'insuline." },
  BMI: { label: "IMC", unit: "", desc: "Un IMC élevé est un facteur de risque bien documenté du diabète de type 2." },
  DiabetesPedigreeFunction: { label: "Antécédents familiaux", unit: "", desc: "Un score élevé reflète une prédisposition génétique plus forte." },
  Age: { label: "Âge", unit: "ans", desc: "Le risque de diabète augmente statistiquement avec l'âge." },
};

export default function Resultat() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="page-wide">
        <p>Aucun résultat à afficher.</p>
        <button onClick={() => navigate("/")}>Retour au questionnaire</button>
      </div>
    );
  }

  const { risk_score, risk_label, top_factors, recommendations } = result;
  const pct = Math.round(risk_score * 100);

  const riskClass = risk_label === "Élevé" ? "eleve" : risk_label === "Modéré" ? "modere" : "faible";
  const riskColor = risk_label === "Élevé" ? "#c0392b" : risk_label === "Modéré" ? "#c8862d" : "#1f9d6b";

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * pct) / 100;

  return (
    <div className="page-wide">
      <h1>Ton résultat</h1>

      <div className="risk-panel">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={radius} fill="none" stroke="#e2e8e8" strokeWidth="9" />
          <circle
            cx="55" cy="55" r={radius} fill="none" stroke={riskColor} strokeWidth="9"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 55 55)"
          />
          <text x="55" y="52" textAnchor="middle" className="risk-gauge-value" fill={riskColor}>{pct}%</text>
          <text x="55" y="68" textAnchor="middle" className="risk-gauge-sub">RISQUE</text>
        </svg>
        <div className="risk-meta">
          <span className={`risk-tag ${riskClass}`}>Risque {risk_label}</span>
          <p className="risk-subtitle">Estimation statistique basée sur les données saisies.</p>
        </div>
      </div>

      <h2>Facteurs statistiques les plus influents</h2>
      <p className="factors-intro">
        Ces facteurs reflètent des tendances statistiques observées dans les données, pas des recommandations d'action individuelles.
      </p>

      <div className="factors-detailed">
        {top_factors.map((factor, index) => {
          const info = factorInfo[factor.factor] || { label: factor.factor, unit: "", desc: "" };
          const increases = factor.impact > 0;
          return (
            <div key={index} className={`factor-card ${increases ? "up" : "down"}`}>
              <div className="factor-card-header">
                <span className="factor-name">{info.label}</span>
                <span className="factor-value">
                  {factor.value !== null ? `${factor.value}${info.unit ? " " + info.unit : ""}` : ""}
                </span>
              </div>
              <div className="factor-bar-track">
                <div
                  className="factor-bar-fill"
                  style={{ width: `${factor.strength}%`, background: increases ? "#c0392b" : "#1f9d6b" }}
                />
              </div>
              <div className="factor-card-footer">
                <span className={`factor-direction ${increases ? "up" : "down"}`}>
                  {increases ? "▲ Augmente le risque" : "▼ Diminue le risque"}
                </span>
                <span className="factor-strength-label">Poids : {factor.strength}%</span>
              </div>
              <p className="factor-desc">{info.desc}</p>
            </div>
          );
        })}
      </div>

      <h2>Recommandations</h2>
      <ul className="recommendations-list">
        {recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
      </ul>

      <button onClick={() => navigate("/")} className="btn-primary">Refaire le questionnaire</button>
    </div>
  );
}