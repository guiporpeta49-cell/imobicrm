import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SideItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200",
          isActive
            ? "border-cyan-400/35 bg-cyan-500/12 text-cyan-200"
            : "border-white/8 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] hover:text-white",
        ].join(" ")
      }
    >
      <span className="text-lg">◫</span>
      <span>{children}</span>
    </NavLink>
  );
}

export default function SuperAdminLayout({ children }) {
  const { logoutSuperAdmin, superAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function sair() {
    logoutSuperAdmin();
    navigate("/super-admin/login");
  }

  return (
    <div className="min-h-screen bg-[#020814]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-cyan-950/60 bg-[#030b17]/90 backdrop-blur-xl md:flex md:flex-col">
          <div className="border-b border-white/5 px-5 py-5">
            <div className="text-lg font-bold text-white">Super Admin</div>
            <div className="text-xs text-slate-400">Gestão de empresas e licenças</div>
          </div>

          <div className="px-3 py-4">
            <SideItem to="/super-admin/empresas">Empresas</SideItem>
          </div>

          <div className="mt-auto border-t border-white/5 p-3">
            <div className="mb-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Usuário</div>
              <div className="mt-2 text-sm font-semibold text-white">{superAdmin?.tipo || "super_admin"}</div>
            </div>
            <button
              onClick={sair}
              className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/16"
            >
              Sair
            </button>
          </div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[88%] max-w-[340px] border-r border-cyan-950/60 bg-[#030b17] p-3">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 px-2 pb-4 pt-2">
                <div>
                  <div className="text-lg font-bold text-white">Super Admin</div>
                  <div className="text-xs text-slate-400">Painel premium</div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300">✕</button>
              </div>
              <SideItem to="/super-admin/empresas" onClick={() => setMobileOpen(false)}>Empresas</SideItem>
              <button
                onClick={sair}
                className="mt-4 w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200"
              >
                Sair
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/5 bg-[#04111f]/85 px-4 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(true)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 md:hidden">☰</button>
                <div>
                  <div className="text-lg font-bold text-white">Empresas</div>
                  <div className="text-xs text-slate-400">Controle de licenças e identidade visual</div>
                </div>
              </div>
              <button onClick={sair} className="hidden rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 md:inline-flex">
                Sair
              </button>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
