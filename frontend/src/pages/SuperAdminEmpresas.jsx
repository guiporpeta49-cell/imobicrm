import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { API_BASE_URL } from "../services/api";

const initialForm = {
  nome: "",
  cnpj: "",
  email: "",
  telefone: "",
  licenca: "",
  limite_usuarios: 5,
  ativa: true,
  vencimento: "",

admin_nome: "",
admin_email: "",
admin_telefone: "",
admin_creci: "",
admin_senha: ""
};

export default function SuperAdminEmpresas() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [logo, setLogo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadEmpresas() {
    try {
      const response = await api.get("/empresas/");
      setItems(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao carregar empresas");
    }
  }

  useEffect(() => {
    loadEmpresas();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setLogo(null);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("nome", form.nome);
      formData.append("cnpj", form.cnpj || "");
      formData.append("email", form.email);
      formData.append("telefone", form.telefone || "");
      formData.append("licenca", form.licenca || "");
      formData.append("limite_usuarios", String(form.limite_usuarios));
      formData.append("ativa", String(form.ativa));
      formData.append("vencimento", form.vencimento || "");

      formData.append("admin_nome", form.admin_nome || "");
      formData.append("admin_email", form.admin_email || "");
      formData.append("admin_telefone", form.admin_telefone || "");
      formData.append("admin_creci", form.admin_creci || "");
      formData.append("admin_senha", form.admin_senha || "");

      if (logo) formData.append("logo", logo);

      if (editingId) {
        await api.put(`/empresas/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Empresa atualizada com sucesso");
      } else {
        await api.post("/super-admin/empresas-com-admin", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Empresa e administrador criados com sucesso");
      }

      resetForm();
      loadEmpresas();
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao salvar empresa");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      nome: item.nome ?? "",
      cnpj: item.cnpj ?? "",
      email: item.email ?? "",
      telefone: item.telefone ?? "",
      licenca: item.licenca ?? "",
      limite_usuarios: item.limite_usuarios ?? 5,
      ativa: Boolean(item.ativa),
      vencimento: item.vencimento ?? "",
      admin_nome: "",
      admin_email: "",
      admin_senha: "",
    });
    setLogo(null);
  }

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return items;

    return items.filter((item) =>
      [item.nome, item.email, item.cnpj, item.telefone, item.licenca]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#071526] to-slate-900 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div>
              <span className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                Painel Super Admin
              </span>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Gestão de Empresas
              </h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Cadastro de empresas com licença, status e primeiro administrador.
              </p>
            </div>

            <div className="w-full lg:w-80">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar empresa..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-300 shadow-lg">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-300 shadow-lg">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {editingId ? "Editar empresa" : "Nova empresa"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {editingId
                  ? "Atualize os dados da empresa."
                  : "Preencha os dados da empresa e crie o primeiro administrador."}
              </p>
            </div>

            <div className="grid gap-4">
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Nome da empresa"
                required
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />

              <input
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                placeholder="CNPJ"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email da empresa"
                required
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />

              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="Telefone"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />

              <input
                name="licenca"
                value={form.licenca}
                onChange={handleChange}
                placeholder="Licença"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />

              <input
                name="limite_usuarios"
                type="number"
                min="1"
                value={form.limite_usuarios}
                onChange={handleChange}
                placeholder="Limite de usuários"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />

              <input
                name="vencimento"
                type="date"
                value={form.vencimento}
                onChange={handleChange}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />

              <label className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                <span className="mb-2 block font-medium text-white">Logo da empresa</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-300"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <span>Empresa ativa</span>
                <input
                  type="checkbox"
                  name="ativa"
                  checked={form.ativa}
                  onChange={handleChange}
                  className="h-4 w-4 accent-emerald-500"
                />
              </label>

              {!editingId && (
                <>
                  <div className="mt-3 text-sm font-semibold text-emerald-300">
                    Primeiro administrador da empresa
                  </div>

                                    <input
                    name="admin_nome"
                    value={form.admin_nome}
                    onChange={handleChange}
                    placeholder="Nome do administrador"
                    required
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                  />

                                          <input
                          name="admin_email"
                          type="email"
                          value={form.admin_email}
                          onChange={handleChange}
                          placeholder="Email do administrador"
                          required
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                        />

                        <input
  name="admin_telefone"
  value={form.admin_telefone}
  onChange={handleChange}
  placeholder="Telefone do administrador"
  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
/>

                  <input
  name="admin_creci"
  value={form.admin_creci}
  onChange={handleChange}
  placeholder="CRECI do administrador"
  required
  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
/>
<input
  name="admin_senha"
  type="password"
  value={form.admin_senha}
  onChange={handleChange}
  placeholder="Senha do administrador"
  required
  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
/>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white"
                >
                  Limpar
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-slate-950"
                >
                  {editingId ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </div>
          </form>

          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-xl md:flex-row md:items-center"
              >
                {item.logo_url ? (
                  <img
                    src={`${API_BASE_URL}${item.logo_url}`}
                    alt={item.nome}
                    className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 text-lg font-bold text-white ring-1 ring-white/10">
                    {item.nome?.[0] || "E"}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="truncate text-lg font-semibold text-white">
                      {item.nome}
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.ativa
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {item.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <div className="text-sm text-slate-300">{item.email}</div>

                  <div className="mt-2 grid gap-1 text-sm text-slate-400 sm:grid-cols-2">
                    <div>Licença: {item.licenca || "-"}</div>
                    <div>Vencimento: {item.vencimento || "-"}</div>
                    <div>CNPJ: {item.cnpj || "-"}</div>
                    <div>Telefone: {item.telefone || "-"}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(item)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 font-medium text-white"
                >
                  Editar
                </button>
              </div>
            ))}

            {!filteredItems.length ? (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/60 p-8 text-center text-sm text-slate-400 shadow-xl">
                Nenhuma empresa encontrada.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}