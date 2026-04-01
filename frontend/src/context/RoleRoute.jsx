import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ children, allow }) {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: 20 }}>Carregando...</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const perfil = String(user?.perfil).toLowerCase();

  if (!allow.includes(perfil)) {
    return <Navigate to="/clientes" replace />;
  }

  return children;
}