//Créer une barre de navigation

import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        🩺 Diabète Info
      </Link>
      <div className="nav-links">
        <Link to="/">Questionnaire</Link>
        <Link to="/historique">Historique</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/utilisateurs">Utilisateurs</Link>
        {isLoggedIn ? (
          <button onClick={handleLogout}>Déconnexion</button>
        ) : (
          <Link to="/login">Connexion</Link>
        )}
      </div>
    </nav>
  );
}