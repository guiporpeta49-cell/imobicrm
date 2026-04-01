import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const activeClasses = {
    emerald: "border-emerald-400/35 bg-emerald-500/12 text-emerald-200 shadow-[0_8px_22px_rgba(16,185,129,0.10)]",
    blue: "border-cyan-400/35 bg-cyan-500/12 text-cyan-200 shadow-[0_8px_22px_rgba(6,182,212,0.10)]",
    amber: "border-amber-400/35 bg-amber-500/12 text-amber-200 shadow-[0_8px_22px_rgba(245,158,11,0.10)]",
    violet: "border-violet-400/35 bg-violet-500/12 text-violet-200 shadow-[0_8px_22px_rgba(139,92,246,0.10)]",
  };

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
            ? activeClasses[accent]
            : "border-white/8 bg-white/[0.02] text-slate-300 hover:-translate-y-0.5 hover:bg-white/[0.05] hover:text-white",
        ].join(" ")
      }
    >
      <span className="text-lg leading-none">{icon}</span>
      {!collapsed ? <span>{label}</span> : null}
    </NavLink>
  );
}

function SidebarSection({ title, collapsed }) {
  if (collapsed) return null;
  return (
    <div className="px-3 pt-5 pb-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</div>
    </div>
  );
}

function SidebarContent({ collapsed, setCollapsed, handleLogout, user, isAdmin, isAtendente, mobile = false, closeMobile }) {
  const empresaNome = user?.empresa_nome || "ImobiCRM";

  return (
    <div className="flex h-full flex-col">
      <div className={`flex items-center border-b border-white/5 px-4 py-5 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-3 min-w-0">
          {user?.empresa_logo ? (
            <img
              src={`http://56.124.16.170:8000${user.empresa_logo}`}
              alt="Logo"
              className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 font-bold text-emerald-200">
              {initials(empresaNome)}
            </div>
          )}

          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-lg font-bold text-white">{empresaNome}</div>
              <div className="truncate text-xs text-slate-400">Painel administrativo premium</div>
            </div>
          ) : null}
        </div>

        {!collapsed && !mobile ? (
          <button
            onClick={() => setCollapsed(true)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 transition hover:bg-white/10"
          >
            ☰
          </button>
        ) : null}

        {mobile ? (
          <button
            onClick={closeMobile}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 transition hover:bg-white/10"
          >
            ✕
          </button>
        ) : null}
      </div>

      {collapsed && !mobile ? (
        <div className="px-3 pt-4">
          <button
            onClick={() => setCollapsed(false)}
            className="flex w-full items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-3 text-slate-300 transition hover:bg-white/[0.05]"
          >
            ☰
          </button>
        </div>
      ) : null}

      <SidebarSection title="principal" collapsed={collapsed} />
      <div className="px-3">
        <nav className="space-y-2">
          {!isAtendente ? (
            <MenuLink to="/" icon="◫" label="Dashboard" collapsed={collapsed} onClick={closeMobile} accent="blue" />
          ) : null}
          <MenuLink to="/clientes" icon="◎" label="Clientes" collapsed={collapsed} onClick={closeMobile} accent="emerald" />
          <MenuLink to="/imoveis" icon="▣" label="Imóveis" collapsed={collapsed} onClick={closeMobile} accent="amber" />
          <MenuLink to="/visitas" icon="◷" label="Agenda / Visitas" collapsed={collapsed} onClick={closeMobile} accent="violet" />
          {!isAtendente ? (
            <MenuLink to="/negociacoes" icon="◈" label="Negociações" collapsed={collapsed} onClick={closeMobile} accent="emerald" />
          ) : null}
        </nav>
      </div>

      {isAdmin ? <SidebarSection title="gestão" collapsed={collapsed} /> : null}
      {isAdmin ? (
        <div className="px-3">
          <nav className="space-y-2">
            <MenuLink to="/corretores" icon="◪" label="Corretores" collapsed={collapsed} onClick={closeMobile} accent="blue" />
          </nav>
        </div>
      ) : null}

      <div className="mt-auto border-t border-white/5 p-3">
        {!collapsed ? (
          <div className="mb-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Usuário</div>
            <div className="mt-2 truncate font-semibold text-white">{user?.nome || user?.email || "Usuário"}</div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {user?.perfil || "perfil"}
              </span>
              <span className="text-xs text-slate-500">online</span>
            </div>
          </div>
        ) : null}

        <button
          onClick={handleLogout}
          title={collapsed ? "Sair" : ""}
          className={`flex w-full items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/16 ${
            collapsed ? "justify-center px-3" : ""
          }`}
        >
          <span className="text-lg">⇆</span>
          {!collapsed ? <span>Sair</span> : null}
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const perfil = String(user?.perfil || "").toLowerCase();
  const isAdmin = perfil === "admin";
  const isAtendente = perfil === "atendente";
  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#020814]">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 hidden h-screen border-r border-cyan-950/60 bg-[#030b17]/90 backdrop-blur-xl transition-all duration-300 md:flex md:flex-col ${
            collapsed ? "w-20" : "w-72"
          }`}
        >
          <SidebarContent
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            handleLogout={handleLogout}
            user={user}
            isAdmin={isAdmin}
            isAtendente={isAtendente}
          />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={closeMobile} />
            <div className="absolute left-0 top-0 h-full w-[88%] max-w-[340px] border-r border-cyan-950/60 bg-[#030b17] shadow-2xl">
              <SidebarContent
                collapsed={false}
                setCollapsed={setCollapsed}
                handleLogout={handleLogout}
                user={user}
                isAdmin={isAdmin}
                isAtendente={isAtendente}
                mobile
                closeMobile={closeMobile}
              />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/5 bg-[#04111f]/85 px-4 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 md:hidden"
                >
                  ☰
                </button>

                <div className="min-w-0">
                  <div className="truncate text-lg font-bold text-white">{pageTitle}</div>
                  <div className="truncate text-xs text-slate-400">
                    {user?.empresa_nome || "ImobiCRM"} • {user?.nome || user?.email || "Usuário"}
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2 text-right">
                  <div className="text-xs text-slate-400">Perfil</div>
                  <div className="text-sm font-semibold text-white">{user?.perfil || "-"}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/16"
                >
                  Sair
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
