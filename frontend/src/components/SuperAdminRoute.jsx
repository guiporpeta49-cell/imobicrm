import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SuperAdminRoute({ children }) {
  const { superAdmin, loading, isSuperAdmin } = useAuth();

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;
  if (!superAdmin) return <Navigate to="/super-admin/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/super-admin/login" replace />;

  return children;
}
