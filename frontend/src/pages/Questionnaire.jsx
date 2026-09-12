import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Baby, Droplet, Activity, Ruler, Syringe,
  Scale, Dna, CalendarDays, ShieldCheck, ArrowRight,
} from "lucide-react";
import api from "../api";

const fields = [
  { name: "pregnancies", label: "Nombre de grossesses", icon: Baby, placeholder: "Ex. : 2" },
  { name: "glucose", label: "Taux de glucose (mg/dL)", icon: Droplet, placeholder: "Ex. : 95" },
  { name: "blood_pressure", label: "Tension artérielle (mm Hg)", icon: Activity, placeholder: "Ex. : 72" },
  { name: "skin_thickness", label: "Épaisseur du pli cutané (mm)", icon: Ruler, placeholder: "Ex. : 25" },
  { name: "insulin", label: "Taux d'insuline (mu U/mL)", icon: Syringe, placeholder: "Ex. : 100" },
  { name: "bmi", label: "IMC (Indice de Masse Corporelle)", icon: Scale, placeholder: "Ex. : 22.5" },
  { name: "diabetes_pedigree", label: "Antécédents familiaux (score 0 à 2.5)", icon: Dna, placeholder: "Ex. : 0.4" },
  { name: "age", label: "Âge", icon: CalendarDays, placeholder: "Ex. : 35" },
];

export default function Questionnaire() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, Number(v)])
      );
      const response = await api.post("/predict", payload);
      navigate("/resultat", { state: { result: response.data } });
    } catch (err) {
      setError("Une erreur est survenue. Vérifie que l'API est bien lancée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wide">
      <div className="hero-card">
        <div className="hero-icon">
          <ClipboardList size={26} strokeWidth={2} />
        </div>
        <div>
          <h1 className="hero-title">Questionnaire de sensibilisation</h1>
          <p className="hero-subtitle">
            Ce questionnaire aide à estimer ton risque statistique de diabète et à comprendre les facteurs qui l'influencent.
          </p>
        </div>
      </div>

      <div className="progress-row">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: "100%" }} />
        </div>
        <span className="progress-label">Étape 1 sur 1</span>
      </div>

      <div className="content-card">
        <div className="content-card-title">
          <ClipboardList size={18} strokeWidth={2} />
          Questionnaire de sensibilisation
        </div>

        <div className="info-note">
          <ShieldCheck size={18} strokeWidth={2} />
          <span>Cet outil est à visée pédagogique uniquement. Il ne remplace pas un diagnostic médical.</span>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {fields.map(({ name, label, icon: Icon, placeholder }) => (
            <label key={name}>
              {label} <span className="required">*</span>
              <div className="input-icon-wrap">
                <Icon size={17} strokeWidth={2} className="input-icon" />
                <input
                  type="number"
                  step="any"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  min="0"
                />
              </div>
            </label>
          ))}

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            <ArrowRight size={18} strokeWidth={2.2} />
            {loading ? "Analyse en cours..." : "Estimer mon risque"}
          </button>
        </form>
      </div>

      <div className="trust-note">
        <ShieldCheck size={18} strokeWidth={2} />
        <div>
          <strong>Tes données sont anonymes.</strong>
          <div>Aucune information personnelle identifiable n'est enregistrée avec tes réponses.</div>
        </div>
      </div>
    </div>
  );
}