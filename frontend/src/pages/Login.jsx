import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png"; // <-- IMPORTANTE

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await login(email, senha);
      navigate("/");
    } catch (error) {
      setErro(error?.response?.data?.detail || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8">
      
      {/* FUNDO */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(15,23,42,0.92),rgba(2,6,23,0.96))]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-2">
        
        {/* LADO ESQUERDO */}
        <div className="hidden flex-col justify-between bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.9))] p-10 text-white lg:flex">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Sistema Imobiliário
            </div>

          

           
          </div>

          <div className="space-y-4">
            

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-lg font-semibold">Gestão completa</div>
              <div className="mt-1 text-sm text-slate-400">
                Gerencie imóveis, clientes, visitas e negociações com uma plataforma moderna e profissional.
            
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto flex max-w-md min-h-full flex-col justify-center">

            {/* LOGO */}
            <div className="mb-8 text-center">
              <img
                src={logo}
                alt="Zeus Sistema Imobiliário"
                className="mx-auto mb-6 w-72 lg:w-80 drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
              />

              <h2 className="text-3xl font-black tracking-tight text-white lg:text-slate-900">
                Entrar
              </h2>

              <p className="mt-2 text-sm text-slate-300 lg:text-slate-500">
                Acesse sua conta para continuar
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200 lg:text-slate-700">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 lg:border-slate-200 lg:bg-white lg:text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200 lg:text-slate-700">
                  Senha
                </label>

                <div className="relative">
                  <input
                    type={showSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-14 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 lg:border-slate-200 lg:bg-white lg:text-slate-900"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white lg:text-slate-500"
                  >
                    {showSenha ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* ERRO */}
              {erro && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 lg:border-red-200 lg:bg-red-50 lg:text-red-700">
                  {erro}
                </div>
              )}

              {/* BOTÃO */}
              <button
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* SUPER ADMIN */}
            <div className="mt-8 text-center">
              <Link
                to="/super-admin/login"
                className="text-sm font-medium text-blue-400 hover:text-blue-300 lg:text-blue-600"
              >
                Entrar como super admin
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}