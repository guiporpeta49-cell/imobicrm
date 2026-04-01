import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import RoleRoute from "./context/RoleRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CorretoresPage from "./pages/Corretores";
import ClientesPage from "./pages/Clientes";
import ImoveisPage from "./pages/Imoveis";
import ImovelDetalhe from "./pages/ImovelDetalhe";
import ImovelPublico from "./pages/ImovelPublico";
import VisitasPage from "./pages/Visitas";
import NegociacoesPage from "./pages/Negociacoes";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminEmpresas from "./pages/SuperAdminEmpresas";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/publico/imovel/:token" element={<ImovelPublico />} />
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route
            path="/super-admin/empresas"
            element={
              <SuperAdminRoute>
                <SuperAdminEmpresas />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/"
            element={
              <RoleRoute allow={["admin", "corretor"]}>
                <Dashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/corretores"
            element={
              <AdminRoute>
                <CorretoresPage />
              </AdminRoute>
            }
          />
          <Route path="/clientes" element={<PrivateRoute><ClientesPage /></PrivateRoute>} />
          <Route path="/imoveis" element={<PrivateRoute><ImoveisPage /></PrivateRoute>} />
          <Route path="/imoveis/:id" element={<PrivateRoute><ImovelDetalhe /></PrivateRoute>} />
          <Route path="/visitas" element={<PrivateRoute><VisitasPage /></PrivateRoute>} />
          <Route
            path="/negociacoes"
            element={
              <RoleRoute allow={["admin", "corretor"]}>
                <NegociacoesPage />
              </RoleRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
