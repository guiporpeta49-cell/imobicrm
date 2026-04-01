import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { API_BASE_URL } from "../services/api";

function initials(value) {
  const text = String(value || "CRM").trim();
  return text.slice(0, 2).toUpperCase();
}

function getPageTitle(pathname) {
  const map = {
    "/": "Dashboard",
    "/clientes": "Clientes",
    "/imoveis": "Imóveis",
    "/visitas": "Agenda e visitas",
    "/negociacoes": "Negociações",
    "/corretores": "Corretores",
    "/propostas": "Propostas",
  };

  if (pathname.startsWith("/imoveis/")) return "Detalhe do imóvel";
  return map[pathname] || "Painel";
}

function MenuLink({ to, label, icon, collapsed, onClick, accent = "emerald" }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : ""}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200",
          collapsed ? "justify-center px-3" : "",
          isActive
            ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-200"
            : "border-white/8 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]",
        ].join(" ")
      }
    >
      <span>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

function SidebarContent({ collapsed, setCollapsed, handleLogout, user }) {
  const empresaNome = user?.empresa_nome || "ImobiCRM";

  const logoSrc = user?.empresa_logo
    ? user.empresa_logo.startsWith("http")
      ? user.empresa_logo
      : `${API_BASE_URL}${user.empresa_logo}`
    : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">

        {/* LOGO */}
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="Logo"
            className="h-11 w-11 rounded-xl object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove("hidden");
            }}
          />
        ) : null}

        {/* FALLBACK */}
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gray-700 text-white font-bold ${
            logoSrc ? "hidden" : ""
          }`}
        >
          {initials(empresaNome)}
        </div>

        {!collapsed && (
          <div>
            <div className="text-white font-bold">{empresaNome}</div>
            <div className="text-xs text-gray-400">Painel</div>
          </div>
        )}
      </div>

      <nav className="p-3 space-y-2">
        <MenuLink to="/" label="Dashboard" icon="🏠" collapsed={collapsed} />
        <MenuLink to="/clientes" label="Clientes" icon="👤" collapsed={collapsed} />
        <MenuLink to="/imoveis" label="Imóveis" icon="🏡" collapsed={collapsed} />
      </nav>

      <div className="mt-auto p-3">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#020814]">

      {/* SIDEBAR */}
      <aside className={`bg-[#030b17] ${collapsed ? "w-20" : "w-72"} transition`}>
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          handleLogout={handleLogout}
          user={user}
        />
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b border-white/10 text-white font-bold">
          {pageTitle}
        </header>

        <main className="p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}