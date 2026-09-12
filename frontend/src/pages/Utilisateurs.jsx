import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Utilisateurs() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api
      .get("/users")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setError("Accès réservé aux administrateurs.");
        } else if (err.response?.status === 401) {
          setError("Tu dois être connecté pour accéder à cette page.");
        } else {
          setError("Erreur lors du chargement des utilisateurs.");
        }
        setLoading(false);
      });
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setUpdating(user.id);

    try {
      await api.patch(`/users/${user.id}/role`, { role: newRole });
      fetchUsers(); // recharge la liste après modification
    } catch (err) {
      alert("Erreur lors de la mise à jour du rôle.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="page">Chargement...</div>;

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <button onClick={() => navigate("/login")}>Se connecter</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Gestion des utilisateurs</h1>

      <table className="history-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Rôle</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <span className={user.role === "admin" ? "badge-admin" : "badge-user"}>
                  {user.role}
                </span>
              </td>
              <td>
                <button
                  onClick={() => toggleRole(user)}
                  disabled={updating === user.id}
                  className="btn-small"
                >
                  {updating === user.id
                    ? "..."
                    : user.role === "admin"
                    ? "Rétrograder en user"
                    : "Promouvoir admin"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}