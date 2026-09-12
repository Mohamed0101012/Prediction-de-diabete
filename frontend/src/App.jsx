import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Questionnaire from "./pages/Questionnaire";
import Resultat from "./pages/Resultat";
import Historique from "./pages/Historique";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Utilisateurs from "./pages/Utilisateurs";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Questionnaire />} />
          <Route path="/resultat" element={<Resultat />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/utilisateurs" element={<Utilisateurs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;