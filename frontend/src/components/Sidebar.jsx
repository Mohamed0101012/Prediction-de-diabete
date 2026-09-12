import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, History, BarChart3, Users, LogIn, LogOut, HeartPulse } from "lucide-react";

const navItems = [
  { to: "/", label: "Questionnaire", icon: ClipboardList },
  { to: "/historique", label: "Historique", icon: History },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/utilisateurs", label: "Utilisateurs", icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <HeartPulse size={20} strokeWidth={2.2} />
        </div>
        <div>
          <div className="brand-name">Diabète Info</div>
          <div className="brand-tagline">Sensibilisation santé</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to ? "active" : ""}`}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isLoggedIn ? (
          <button className="sidebar-link logout" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={2} />
            Déconnexion
          </button>
        ) : (
          <Link to="/login" className="sidebar-link">
            <LogIn size={18} strokeWidth={2} />
            Connexion
          </Link>
        )}
      </div>
    </aside>
  );
}