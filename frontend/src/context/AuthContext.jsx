import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { decodeJwt } from "../utils/jwt";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  async function hydrateUserFromToken(token) {
    const payload = decodeJwt(token);

    if (!payload?.sub) {
      setUser({ autenticado: true, perfil: null, id: null });
      return;
    }

    const perfilFromToken = payload?.perfil || null;
    const nomeFromToken = payload?.nome || null;
    const emailFromToken = payload?.email || null;
    const empresaIdFromToken = payload?.empresa_id || null;
    const empresaNomeFromToken = payload?.empresa_nome || null;
    const empresaLogoFromToken = payload?.empresa_logo || null;

    try {
      const response = await api.get("/corretores/");
      const current = response.data.find((item) => String(item.id) === String(payload.sub));

      if (current) {
        setUser({
          autenticado: true,
          id: current.id,
          nome: current.nome,
          email: current.email,
          perfil: current.perfil || perfilFromToken,
          empresa_id: current.empresa_id || empresaIdFromToken,
          empresa_nome: empresaNomeFromToken,
          empresa_logo: empresaLogoFromToken,
        });
      } else {
        setUser({
          autenticado: true,
          id: Number(payload.sub),
          nome: nomeFromToken,
          email: emailFromToken,
          perfil: perfilFromToken,
          empresa_id: empresaIdFromToken,
          empresa_nome: empresaNomeFromToken,
          empresa_logo: empresaLogoFromToken,
        });
      }
    } catch {
      setUser({
        autenticado: true,
        id: Number(payload.sub),
        nome: nomeFromToken,
        email: emailFromToken,
        perfil: perfilFromToken,
        empresa_id: empresaIdFromToken,
        empresa_nome: empresaNomeFromToken,
        empresa_logo: empresaLogoFromToken,
      });
    }
  }

  async function hydrateSuperAdminFromToken(token) {
    const payload = decodeJwt(token);
    if (!payload?.sub) {
      setSuperAdmin({ autenticado: true });
      return;
    }

    setSuperAdmin({
      autenticado: true,
      id: Number(payload.sub),
      tipo: payload.tipo,
    });
  }

  async function login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    const token = response.data.access_token;
    localStorage.setItem("token", token);
    await hydrateUserFromToken(token);
  }

  async function loginSuperAdmin(email, senha) {
    const response = await api.post("/super-admin/login", { email, senha });
    const token = response.data.access_token;
    localStorage.setItem("super_admin_token", token);
    await hydrateSuperAdminFromToken(token);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  function logoutSuperAdmin() {
    localStorage.removeItem("super_admin_token");
    setSuperAdmin(null);
  }

  useEffect(() => {
    async function bootstrap() {
      const companyToken = localStorage.getItem("token");
      const masterToken = localStorage.getItem("super_admin_token");

      if (companyToken) await hydrateUserFromToken(companyToken);
      if (masterToken) await hydrateSuperAdminFromToken(masterToken);

      setLoading(false);
    }
    bootstrap();
  }, []);

  const isAdmin = String(user?.perfil).toLowerCase() === "admin";
  const isSuperAdmin = superAdmin?.tipo === "super_admin";

  return (
    <AuthContext.Provider
      value={{ user, superAdmin, loading, login, loginSuperAdmin, logout, logoutSuperAdmin, isAdmin, isSuperAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
