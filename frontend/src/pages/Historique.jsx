import { useEffect, useState } from "react";
import api from "../api";

export default function Historique() {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/history")
      .then((response) => {
        setHistorique(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Impossible de charger l'historique.");
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) return <div className="page">Chargement...</div>;
  if (error) return <div className="page">{error}</div>;

  return (
    <div className="page">
      <h1>Historique anonyme</h1>
      <p className="disclaimer">
        Ces données sont anonymes et ne sont liées à aucun compte utilisateur.
      </p>

      {historique.length === 0 ? (
        <p>Aucune donnée pour le moment.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Glucose</th>
              <th>IMC</th>
              <th>Âge</th>
              <th>Risque</th>
            </tr>
          </thead>
          <tbody>
            {historique.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.created_at).toLocaleDateString("fr-FR")}</td>
                <td>{entry.glucose}</td>
                <td>{entry.bmi}</td>
                <td>{entry.age}</td>
                <td>{Math.round(entry.risk_score * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}